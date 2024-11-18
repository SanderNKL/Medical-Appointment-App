import React from 'react';

import ErrorMessage from '@/components/Error';
import Loading from '@/components/Loading';
import { AvailableSlot } from '@/components/Calendar';

interface DoctorListProps {
    clinicId: number;
    loading: boolean;
    error?: string;
    clinicAppointments: AvailableSlot[];
}

const DoctorList: React.FC<DoctorListProps> = ({ clinicId, loading, error, clinicAppointments }) => {
    // Format Datetime
    function formatTime(slot: Date) {
        const date = new Date(slot);
        let hours = date.getHours().toString().padStart(2, '0');
        let minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // Organize appointments by slot times
    const organizeAppointmentsBySlot = (appointments: AvailableSlot[]) => {
        const slotsMap = new Map<string, AvailableSlot[]>();

        appointments.forEach(doctor => {
            doctor.availableSlots.forEach(slot => {
                if (!slotsMap.has(slot)) {
                    slotsMap.set(slot, []);
                }
                slotsMap.get(slot)?.push(doctor);
            });
        });

        return Array.from(slotsMap.entries()).sort(([slotA], [slotB]) => new Date(slotA).getTime() - new Date(slotB).getTime());
    };

    if (loading) {
        return (
          <div>
            <Loading />
          </div>
        )
    }

    if (error) {
        return (
            <ErrorMessage error={error} />
        );
    }

    if (clinicAppointments && clinicAppointments.length > 0) {
        return (
            <ul className="space-y-4">
                {organizeAppointmentsBySlot(clinicAppointments).map(([availableTime, doctors]) => (
                    <li key={availableTime} className="mb-4">
                        {doctors.map(doctor => (
                            <a key={doctor.doctorId} href={`/book/${clinicId}/form?doctorId=${doctor.doctorId}&date=${availableTime}`}>
                                <div className="hover:bg-gray-200 transition duration-300 rounded-lg mb-4">
                                    <div className="p-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-xl text-green-800 font-semibold">{doctor.firstName} {doctor.lastName}</h2>
                                                <p className="text-green-700">Specialty: {doctor.specialty}</p>
                                            </div>
                                            <div className="mt-2">
                                                <div className="bg-green-900 text-center py-2 px-4 hover:bg-green-700 transition duration-300 rounded-full inline-block">
                                                    <span className="text-sm text-white">{formatTime(new Date(availableTime))}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </li>
                ))}
            </ul>
        );
    } else {
        return null;
    }
};

export default DoctorList;