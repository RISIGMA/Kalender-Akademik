import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const CATEGORY_COLORS = {
  'Teknologi & Riset': '#0284C7',
  'Seminar & Kuliah Tamu': '#7C3AED',
  'Seni & Budaya': '#DB2777',
  'Karir & Kewirausahaan': '#EA580C',
};

export const CalendarView = ({ events, onSelectEvent }) => {
  const mapped = events.map(ev => ({
    id: String(ev.id),
    title: ev.title,
    start: ev.startAt,
    end: ev.endAt,
    backgroundColor: CATEGORY_COLORS[ev.category] || '#475569',
    borderColor: 'transparent',
    extendedProps: { location: ev.location, organization: ev.organization },
  }));

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Jadwal Kalender Kegiatan</h3>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek',
        }}
        events={mapped}
        eventClick={info => onSelectEvent(info.event.id)}
        eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        height="auto"
      />
    </div>
  );
};
