'use client';

import { fetchData } from '@/lib/api';
import { useEffect, useState } from 'react';

import DoctorList from '@/components/DoctorList';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/Error';

interface CalendarProps {
    clinicId: string;
}

export interface AvailableSlot {
    doctorId: number;
    firstName: string;
    lastName: string;
    specialty: string;
    availableSlots: string[];
}

interface SelectedDate {
    year: number;
    month: number;
    day: number;
}

const CalendarUI: React.FC<CalendarProps> = ({ clinicId }) => {
    // Used to track where the user is in the calendar.
    const [viewingYear, setViewingYear] = useState<number>(new Date().getFullYear());
    const [viewingMonth, setViewingMonth] = useState<number>(new Date().getMonth());

    // Available Doctors
    const [clinicAppointments, setClinicAppointments] = useState<AvailableSlot[] | null>(null);
    const [selectedDate, setSelectedDate] = useState<SelectedDate | null>(null);

    // Loading an Errors
    const [calendarLoading, setCalendarLoading] = useState<boolean>(true);
    const [calendarError, setCalendarError] = useState<string>();
    const [doctorLoading, setDoctorLoading] = useState<boolean>(false);
    const [doctorError, setDoctorError] = useState<''>();

    // Get the calendar days for a month in a year
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const [availableDates, setAvailableDates] = useState<string[]>([]);

    useEffect(() => {
        const fetchAvailableAppointmentDates = async () => {
            setCalendarLoading(true);

            // Reset selection and old data loaded.
            setClinicAppointments(null);
            setSelectedDate(null)

            const daysInMonth = new Date(viewingYear, viewingMonth + 1, 0).getDate();
            const availableDates: string[] = [];
    
            // Fetching available appointments for each day in the month
            for (let day = 1; day <= daysInMonth; day++) {
                const date = `${viewingYear}-${padZero(viewingMonth + 1)}-${padZero(day)}`;
                const response = await fetchData(`/Appointment/AvailableAppointments?clinicId=${clinicId}&date=${date}`);
    
                // Checking if appointments are available for the current day
                if (response.length > 0) {
                    availableDates.push(date);
                }
            }
    
            // Setting the state with the available dates
            setCalendarLoading(false);
            setAvailableDates(availableDates);
        };
    
        fetchAvailableAppointmentDates();
    }, [clinicId, viewingYear, viewingMonth]);

    const padZero = (num: number) => {
        return num < 10 ? '0' + num : num;
    };

    // Generate calendar days into the calendar
    const generateDays = () => {
        try {
            const daysInMonth = getDaysInMonth(viewingYear, viewingMonth);
            const firstDayOfMonth = new Date(viewingYear, viewingMonth).getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday

            // Determine the index of Monday in adjusted array
            const mondayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

            // Days in the calendar. (Calendar content)
            const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const daysContent = [];

            // Generate day names
            for (let i = 0; i < 7; i++) {
                daysContent.push(
                    <div key={`dayName${i}`} className="py-2">
                        {dayNames[i].substring(0, 2)}
                    </div>
                );
            }

            // Add empty elements if necessary to align the dates with the weekday names
            if (mondayIndex !== 0) {
                for (let i = 1; i <= mondayIndex && i < 7; i++) {
                    daysContent.push(<div key={`empty${i}`} className="text-center py-2"></div>);
                }
            }
            let currentWeekday = mondayIndex;

            // Display each date for this month.
            for (let i = 1; i <= daysInMonth; i++) {
                const isAvailable = availableDates.includes(`${viewingYear}-${padZero(viewingMonth + 1)}-${padZero(i)}`);

                // Mark the selected date in the calendar
                const isSelectedDate = selectedDate &&
                    selectedDate.year === viewingYear &&
                    selectedDate.month === viewingMonth &&
                    selectedDate.day === i;

                // Apply Styling for dates
                const dayClassNames = [
                    'text-center',
                    'py-2',
                    'w-10',
                    'h-10',
                    'flex',
                    'items-center',
                    'justify-center',
                    'rounded-full',
                    isSelectedDate ? 'border-2 border-green-800' : '' // Apply darker border for selected day
                ];
                
                // Check if the day is available and push the dates for use later.

                if (isAvailable) {
                    dayClassNames.push('bg-green-100 border border-green-900');

                    // Push Interactable Calendar Date
                    daysContent.push(
                        <div
                            key={`day${i}`}
                            className={`${dayClassNames.join(' ')} transition duration-300 transform hover:scale-125 text-green-900`}
                            onClick={() => handleDateSelect(viewingYear, viewingMonth, i)}>
                        {i}
                        </div>
                    );     
                } else { // These dates are either booked or outside business hours.
                    dayClassNames.push('bg-gray-light text-gray-dark');

                    // Push Locked Calendar Date
                    daysContent.push(
                        <div key={`day${i}`} className={dayClassNames.join(' ')}>
                            {i}
                        </div>
                    );
                }
                currentWeekday = (currentWeekday + 1) % 7;
            }
            return daysContent;
        } catch (err) {
            const errorObj = err as Error;
            console.error('Error fetching available appointments:', errorObj);
            setCalendarError(errorObj.message);
        }
    };

    // Allows the user to go to the next month.
    const goToNextMonth = () => {
        setViewingMonth((prevMonth) => {
            if (prevMonth === 11) {
                setViewingYear(viewingYear + 1);
                return 0;
            } else {
                return prevMonth + 1;
            }
        });
    };

    // Allows the user to go to the previous month.
    const goToPrevMonth = () => {
        setViewingMonth(prevMonth => {
            if (prevMonth === 0) {
            setViewingYear(viewingYear - 1);
            return 11;
            } else {
            return prevMonth - 1;
            }
        });
    };

    // Fetch Available Doctors from a selected Date
    const fetchAvailableDoctorAppointments = async (clinicId: string, date: string) => {
        const response = await fetchData(`/Appointment/AvailableAppointments?clinicId=${clinicId}&date=${date}`);
        return response as AvailableSlot[];
    }; 
    
    // Handle the processing Logic for clicking dates in the calendar
    const handleDateSelect = (year: number, month: number, day: number) => {
        setSelectedDate({ year, month, day });
        const date = new Date(year, month, day);
        setDoctorLoading(true);
        if (date !== null) {
            const formattedDate = `${year}-${month + 1}-${day}`
            fetchAvailableDoctorAppointments(clinicId, formattedDate)
                .then((appointments) => {
                    setClinicAppointments(appointments);
                    setDoctorLoading(false);
                })
                .catch((errorObj) => {
                    console.error('Error fetching available appointments:', errorObj);
                    setDoctorError(errorObj.message);
                    setDoctorLoading(false);
                });
        }
    };

    // Display the monthName in the calendar
    const monthName = new Date(viewingYear, viewingMonth).toLocaleString('en-US', { month: 'long' });
    
    if (calendarLoading) {
        return (
            <div>
              <Loading/>
            </div>
          );
    }

    if (calendarError) {
        return (
            <ErrorMessage error={calendarError} />
        );
    }

    return (
        <div>
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="flex justify-between items-center p-4">
                    <button className="text-gray-600" onClick={goToPrevMonth}>{'<'}</button>
                    <div className="text-green-800 text-lg font-semibold py-2">{monthName} {viewingYear}</div>
                    <button className="text-gray-600" onClick={goToNextMonth}>{'>'}</button>
                </div>
                <div className="grid grid-cols-7 gap-2 p-4 justify-items-center">
                    {generateDays()}
                </div>
            </div>
            <div className="mb-8"></div>
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
                <DoctorList clinicId={Number(clinicId)} loading={doctorLoading} error={doctorError} clinicAppointments={clinicAppointments!} />
            </div>
        </div>
    );
};

export default CalendarUI;
