import React, { useState, useEffect, useMemo } from 'react';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';

// --- Funções Auxiliares ---

const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');
    return `${hours}:${mins}`;
};

const generateAvailableSlots = (operatingDays, operatingHours, minLeadTimeHours = 24) => {
    if (!operatingDays || !operatingHours) return [];

    const dayMap = { 'dom': 0, 'seg': 1, 'ter': 2, 'qua': 3, 'qui': 4, 'sex': 5, 'sab': 6 };
    const dayNames = Object.keys(dayMap);

    let normalizedDays = operatingDays.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+e\s+/g, ',').replace(/\s*a\s+/g, ' a ').replace(/\s+/g, ' ').trim();
    const workingDayNumbers = new Set();
    const parts = normalizedDays.split(',');

    parts.forEach(part => {
        if (part.includes(' a ')) {
            const [startDay, endDay] = part.split(' a ').map(d => d.trim().substring(0, 3));
            let startIndex = dayNames.indexOf(startDay);
            let endIndex = dayNames.indexOf(endDay);
            if (startIndex !== -1 && endIndex !== -1) {
                if (startIndex <= endIndex) {
                    for (let i = startIndex; i <= endIndex; i++) workingDayNumbers.add(dayMap[dayNames[i]]);
                } else {
                    for (let i = startIndex; i <= 6; i++) workingDayNumbers.add(dayMap[dayNames[i]]);
                    for (let i = 0; i <= endIndex; i++) workingDayNumbers.add(dayMap[dayNames[i]]);
                }
            }
        } else {
            const day = part.trim().substring(0, 3);
            if (dayNames.includes(day)) workingDayNumbers.add(dayMap[day]);
        }
    });

    const timeIntervals = [];
    let normalizedHours = operatingHours.toLowerCase().replace(/h/g, ':').replace(/\s/g, '').replace(/as|às/g, '');
    const hourParts = normalizedHours.split(/[,e]/);
    hourParts.forEach(part => {
        const [start, end] = part.split(/[-aate]/).filter(Boolean);
        if (start && end) {
            timeIntervals.push({ start: timeToMinutes(start), end: timeToMinutes(end) });
        }
    });

    const slots = [];
    const now = new Date();
    const minTime = new Date(now.getTime() + minLeadTimeHours * 60 * 60 * 1000);
    const timeSlotInterval = 30;

    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
        const currentDate = new Date();
        currentDate.setDate(now.getDate() + dayOffset);
        currentDate.setHours(0,0,0,0);

        if (workingDayNumbers.has(currentDate.getDay())) {
            const dateStr = currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const daySlots = { date: dateStr, times: [] };

            timeIntervals.forEach(interval => {
                let currentSlotTime = interval.start;
                while (currentSlotTime < interval.end) {
                    const slotDateTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), Math.floor(currentSlotTime / 60), currentSlotTime % 60);

                    if (slotDateTime > minTime) {
                        daySlots.times.push(minutesToTime(currentSlotTime));
                    }
                    currentSlotTime += timeSlotInterval;
                }
            });

            if (daySlots.times.length > 0) {
                slots.push(daySlots);
            }
        }
    }
    return slots;
};

// --- Componente Principal ---

export const DateTimePicker = ({ operatingDays, operatingHours, onChange, minLeadTimeHours }) => {
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

    useEffect(() => {
        const slots = generateAvailableSlots(operatingDays, operatingHours, minLeadTimeHours);
        setAvailableSlots(slots);
    }, [operatingDays, operatingHours, minLeadTimeHours]);

    useEffect(() => {
        if (selectedDate && selectedTime) {
            const dateStr = selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            onChange(`${dateStr} às ${selectedTime}`);
        } else {
            onChange(null);
        }
    }, [selectedDate, selectedTime, onChange]);

    const availableDatesSet = useMemo(() => new Set(availableSlots.map(slot => slot.date)), [availableSlots]);

    const timesForSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        const dateStr = selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        return availableSlots.find(slot => slot.date === dateStr)?.times || [];
    }, [selectedDate, availableSlots]);

    const handleDateSelect = (day, isAvailable) => {
        if (!isAvailable) return;
        setSelectedDate(day);
        setSelectedTime('');
    };

    const handleMonthChange = (offset) => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const renderCalendar = () => {
        const month = currentMonth.getMonth();
        const year = currentMonth.getFullYear();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-start-${i}`} className="w-10 h-10"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const dateStr = currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const isAvailable = availableDatesSet.has(dateStr);
            const isSelected = selectedDate && currentDate.getTime() === selectedDate.getTime();

            const baseClasses = "w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200 text-sm";
            let dayClasses = baseClasses;

            if (isAvailable) {
                dayClasses += " cursor-pointer hover:bg-primary/20";
                if (isSelected) {
                    dayClasses += " bg-primary text-white font-bold";
                } else {
                    dayClasses += " bg-gray-100 text-gray-800";
                }
            } else {
                dayClasses += " text-gray-300 cursor-not-allowed";
            }

            days.push(
                <button
                    type="button"
                    key={dateStr}
                    onClick={() => handleDateSelect(currentDate, isAvailable)}
                    disabled={!isAvailable}
                    className={dayClasses}
                >
                    {day}
                </button>
            );
        }
        return days;
    };

    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <button type="button" onClick={() => handleMonthChange(-1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={20} /></button>
                    <h3 className="font-bold text-base text-gray-800 text-center">
                        {currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
                    </h3>
                    <button type="button" onClick={() => handleMonthChange(1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight size={20} /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 font-medium mb-2">
                    {weekdays.map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 place-items-center">
                    {renderCalendar()}
                </div>
            </div>

            {selectedDate && (
                <div className="animate-fadeIn">
                    <h3 className="font-semibold text-gray-700 mb-3 border-t pt-4 flex items-center gap-2">
                        <Clock size={16} />
                        Horários para {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {timesForSelectedDate.length > 0 ? (
                            timesForSelectedDate.map(time => {
                                const isSelected = time === selectedTime;
                                return (
                                    <button
                                        type="button"
                                        key={time}
                                        onClick={() => setSelectedTime(time)}
                                        className={`p-2 border rounded-lg text-sm transition-colors duration-200 ${isSelected ? 'bg-primary text-white border-primary font-bold' : 'bg-white border-gray-200 hover:bg-gray-100'}`}
                                    >
                                        {time}
                                    </button>
                                );
                            })
                        ) : (
                            <p className="text-sm text-gray-500 col-span-full">Não há horários disponíveis para esta data.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

