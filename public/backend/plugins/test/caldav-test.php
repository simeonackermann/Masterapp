<?php

//use it\thecsea\simple_caldav_client\SimpleCalDAVClient;
require_once( './simpleCalDAV//SimpleCalDAVClient.php');


try {
            $caldavClient = new SimpleCalDAVClient();
            $caldavClient->connect('http://webkraut.de/remote.php/caldav/calendars/simi/caldavtest', 'simi', 'ow-megamix87');
            $arrayOfCalendars = $caldavClient->findCalendars();
            $caldavClient->setCalendar($arrayOfCalendars["caldavtest"]);
            $events = $caldavClient->getEvents('20181101T000000Z', '20181130T000000Z');

            echo "<pre>";
            //var_dump($events);
            foreach ($events as $key => $event) {
                var_dump($event->getData());
                echo "<br />";
            }
            echo "</pre>";
        } catch (Exception $e) {
            echo $e->__toString();
        }

        ?>