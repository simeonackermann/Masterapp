<?php

use Sabre\VObject;

require_once ABSPATH . '/includes/adapter/simpleCalDAV//SimpleCalDAVClient.php';

class Adapter_CalDAV extends Adapter {

    private $caldavClient = null;

    private $enabled = true;

    private $syncFromDate = null;

    private $syncToDate = null;

    public function enable() {
        // TODO check adapter db values, may create defaults
    }

    public function isEnabled() {
        return $this->enabled;
    }

    public function test() {
        $this->subtest();
        return true;
    }

    public function subtest() {
        var_dump("sub");
    }

    public function init() {
        $this->caldavClient = new SimpleCalDAVClient();
        $this->syncFromDate = date('Ymd\T000000\Z');
        $this->syncToDate = date('Ymt\T000000\Z', strtotime("+2 months", strtotime($this->syncFromDate)));

        $cj = $this->getApp()->getCronjob();

        $cj->register([$this, 'syncCalendars'], $this->getUpdatePeriod());

        // $lastUpdate = $this->getLastUpdate();
        // $period = $this->getUpdatePeriod();
        // $time = time();

        // if ($time - $period < $lastUpdate) {
        //     return;
        // }

        // $this->caldavClient = new SimpleCalDAVClient();

        // $this->syncFromDate = date('Ym01\T000000\Z');
        // $this->syncToDate = date('Ymt\T000000\Z');

        // // TODO call it as async background job
        // // https://github.com/asyncphp/doorman
        // $this->syncCalendars();
    }

    private function getUpdatePeriod() {
        return 60*60*24;
    }

    private function getLastUpdate() {
        $db = $this->getDb();

        $db->where ("name", "adapter-caldav-last-update");
        $lastUpdate = $db->getOne ("system");

        if (!isset($lastUpdate) || !isset($lastUpdate["value"])) {
            return 0;
        }

        return $lastUpdate["value"];
    }

    private function setLastUpdate($update) {
        $db = $this->getDb();
        $value = [
            'value' => $update
        ];
        $db->where('name', 'adapter-caldav-last-update');
        if (!$db->update ('system', $value)) {
            throw new Exception($db->getLastError());
        }
        return true;
    }

    public function syncCalendars() {
        $db = $this->getDb();
        $calendars = $this->getCalendars();

        if (empty($calendars)) {
            return;
        }

        $eventsToImport = [];
        $insertErrors = [];

        // kalender holen
        // remote events  holen
        // lokale caldav jobs holen
        // remote events filtern mit lokalen caldav jobs
        // events importieren

        $jobsDateStart = date("Y-m-d 00:00:00", strtotime($this->syncFromDate));
        $josbDateEnd = date("Y-m-d 00:00:00", strtotime($this->syncToDate));

        $isCaldav = $db->subQuery("m");
        $isCaldav->where("meta_key", "job_from_caldav_adapter");
        // $isCaldav->get("job_meta", null, "job_id");
        $isCaldav->get("job_meta");

        // $db->where("id", $isCaldav, 'in');
        $db->join($isCaldav, "j.id=m.job_id", "RIGHT");
        $db->where("date_start", $jobsDateStart, ">=");
        $db->where("date_start", $josbDateEnd, "<=");
        $existingCaldavJobs = $db->get("jobs j", null, "j.id, m.meta_value");


        foreach ($existingCaldavJobs as $key => $job) {
            $existingCaldavJobs[$key] = array_merge( json_decode($job['meta_value'], true), ["job_id" => $job['id']] );
        }

        foreach ($calendars as $key => $calendar) {
            try {
                $events = $this->getEventsFromRemote($calendar, $this->syncFromDate, $this->syncToDate);
            } catch (Exception $e) {
                throw new Exception($e->__toString());
                break;
            }

            foreach ($events as $key => $event) {
                $event = $event->getData();
                $vcard = VObject\Reader::read($event);
                $event = $vcard->VEVENT;

                // echo $event->serialize();
                // echo "<br>";

                $eventId = $event->UID;
                $calendarId = $calendar['calendar'];

                $exists = array_filter(
                    $existingCaldavJobs,
                    function($v) use ($eventId, $calendarId) {
                        return $v['calendar'] == $calendarId && $v['uid'] == $eventId;
                    }
                );
                if (empty($exists)) {
                    $eventsToImport[] = $event;
                }
            }

            foreach ($eventsToImport as $key => $event) {
                $uid = $event->UID->getValue();

                $start = $event->DTSTART->getDateTime();
                $end = $event->DTEND->getDateTime();
                $jobData = [
                    "date_start" => $start->format('Y-m-d H:i:s'),
                    "date_end"  => $end->format('Y-m-d H:i:s'),
                    "title" => $event->SUMMARY->getValue(),
                    "description" => $event->DESCRIPTION ? $event->DESCRIPTION->getValue() : null,
                    // "creator" => ???
                    // TODO category as add ($event->CATEGORIES)
                    // TODO location as add ($event->LOCATION)
                ];

                // TODO get jobs api -> call createJob($data)

                $jid = $db->insert ('jobs', $jobData);

                if (!$jid) {
                    $insertErrors[] = $db->getLastError();
                    continue;
                }

                $metaData = [
                    "job_id" => $jid,
                    "meta_key" => "job_from_caldav_adapter",
                    "meta_value" => json_encode([
                        "calendar" => $calendar['calendar'],
                        "uid" => $uid,
                        "imported_at" => date("Y-m-d H:i:s")
                    ])
                ];
                $mid = $db->insert ('job_meta', $metaData);
                if (!$mid) {
                    $insertErrors[] = $db->getLastError();
                }

                // echo "Imported event $uid as job $jid";
                // echo "<br />";
            }
        }

        if (!empty($insertErrors)) {
            echo "Got Errors on import events:";
            var_dump($insertErrors);
        }

        $this->setLastUpdate(time());

    }

    private function getCalendars() {
        return [
            [
                "url" => "http://webkraut.de/remote.php/caldav/calendars/simi/caldavtest",
                "user" => "simi",
                "password" => "ow-megamix87",
                "calendar" => "caldavtest"
            ],
        ];
    }

    private function getEventsFromRemote($calendarConfig = [], $fromDate = null, $toDate = null) {

        try {
            $this->caldavClient->connect($calendarConfig['url'], $calendarConfig['user'], $calendarConfig['password']);
            $arrayOfCalendars = $this->caldavClient->findCalendars();
            $this->caldavClient->setCalendar($arrayOfCalendars[$calendarConfig['calendar']]);
            //$events = $this->caldavClient->getEvents('20181101T000000Z', '20181130T000000Z');
            $events = $this->caldavClient->getEvents($fromDate, $toDate);
        }
        catch (Exception $e) {
            throw new Exception($e->__toString());
        }

        return $events;

        $events = [
            'BEGIN:VCALENDAR
VERSION:2.0
PRODID:ownCloud Calendar
BEGIN:VEVENT
CREATED;VALUE=DATE-TIME:20181109T152352Z
UID:94d1a7e0c4
LAST-MODIFIED;VALUE=DATE-TIME:20181113T144654Z
DTSTAMP;VALUE=DATE-TIME:20181113T144654Z
SUMMARY:Tes t1
DTSTART;VALUE=DATE-TIME;TZID=Europe/Berlin:20181108T170000
DTEND;VALUE=DATE-TIME;TZID=Europe/Berlin:20181108T180000
CLASS:PUBLIC
END:VEVENT
END:VCALENDAR',
            'BEGIN:VCALENDAR
VERSION:2.0
PRODID:ownCloud Calendar
BEGIN:VEVENT
CREATED;VALUE=DATE-TIME:20181109T152404Z
UID:2d904e3d1a
LAST-MODIFIED;VALUE=DATE-TIME:20181113T144620Z
DTSTAMP;VALUE=DATE-TIME:20181113T144620Z
SUMMARY:Test 2
DTSTART;VALUE=DATE-TIME;TZID=Europe/Berlin:20181114T000000
DTEND;VALUE=DATE-TIME;TZID=Europe/Berlin:20181114T000000
CLASS:PUBLIC
CATEGORIES:Anruf
END:VEVENT
END:VCALENDAR',
            'BEGIN:VCALENDAR
VERSION:2.0
PRODID:ownCloud Calendar
BEGIN:VEVENT
CREATED;VALUE=DATE-TIME:20181113T144724Z
UID:e9316d8441
LAST-MODIFIED;VALUE=DATE-TIME:20181113T144724Z
DTSTAMP;VALUE=DATE-TIME:20181113T144724Z
SUMMARY:Ganzer Täg
DTSTART;VALUE=DATE:20181116
DTEND;VALUE=DATE:20181117
END:VEVENT
END:VCALENDAR'
        ];
        return $events;
    }


}

?>