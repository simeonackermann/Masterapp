<?php

use Sabre\VObject;

require_once ABSPATH . '/includes/adapter/simpleCalDAV//SimpleCalDAVClient.php';

class Adapter_CalDAV extends Adapter {

    private $caldavClient = null;

    private $enabled = true;

    public function enable() {
        // TODO check plugin db values, may create defaults
    }

    public function isEnabled() {
        return $this->enabled;
    }

    public function init() {
        $this->caldavClient = new SimpleCalDAVClient();

        // var_dump( $this->getDb() );

        // check last update
        // may update

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


        //var_dump($events);

        // $haveEvent = preg_match('/BEGIN:VEVENT(.*)END:VEVENT/s', $events[0], $event);
        // $haveSummary = preg_match('/SUMMARY:(.*)/', $event[1], $summary);
        // $haveDateStart = preg_match('/DTSTART.*:(.*)/', $event[1], $dstart);
        // var_dump($summary);

        // var_dump($dstart);

        // $date = DateTime::createFromFormat('Ymd+', $dstart[1]);
        // var_dump( $date->format('Y-m-d') );

        // die();

        $vcard = VObject\Reader::read($events[2]);
        $event = $vcard->VEVENT;

        echo "$event->UID<br />";

        echo "$event->SUMMARY <br />";

        $start = $event->DTSTART->getDateTime();
        $end = $event->DTEND->getDateTime();
        echo $start->format(\DateTime::W3C);
        echo "<br />";
        echo $end->format(\DateTime::W3C);

        die();

        $lastUpdate = $this->getLastUpdate();
        $period = $this->getUpdatePeriod();
        $time = time();


        echo "<pre>";
        if ($time - $period > $lastUpdate) {
            // update
            $calendars = $this->getCalendars();
            foreach ($calendars as $key => $calendar) {
                $events = $this->getEventsFromRemote($calendar);
                //var_dump($events[0]->getData());
                $vcard = VObject\Reader::read($events[0]->getData());
                var_dump($vcard->serialize());
            }
        }
        echo "</pre>";
    }

    private function getUpdatePeriod() {
        return 60*60;
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
        return true;
    }


    private function getCalendars() {
        return [
            [
                "url" => "",
                "user" => "",
                "password" => "",
                "calendar" => ""
            ],
        ];
    }

    private function getEventsFromRemote($config = []) {
        $this->caldavClient->connect($config['url'], $config['user'], $config['password']);
        $arrayOfCalendars = $this->caldavClient->findCalendars();
        $this->caldavClient->setCalendar($arrayOfCalendars[$config['calendar']]);
        $events = $this->caldavClient->getEvents('20181101T000000Z', '20181130T000000Z');
        return $events;
    }


}

?>
