'use client';

import { useEffect, useState } from 'react';
import { fetchData } from '@/lib/api';

import Loading from '@/components/Loading';
import ErrorMessage from '@/components/Error';

export interface Doctor {
    id: number;
    firstName: string;
    lastName: string;
    speciality?: {
      id: number;
      name: string;
    } | null;
}

export interface Clinic {
    id: number;
    name: string;
    address: string;
    doctors: Doctor[];
}

const ClinicBookingList: React.FC = () => {
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const data = await fetchData('/clinic');
                if (!data) {
                    throw new Error('Failed to fetch data');
                }
                setClinics(data);
                setLoading(false);
            } catch (err) {
                const errorObj = err as Error;
                setError(errorObj.message);
                setLoading(false);
            }
        };

        fetchGenres();
    }, []);

    // Display Loading, if Loading.
    if (loading) {
        return (
          <div>
            <Loading />
          </div>
        )
    }

    // Display an error if any.
    if (error) {
        return (
            <ErrorMessage error={error} />
        );
    }

    // If there are no clinics, return a proper message.
    if (clinics.length < 1) {
        return (
            <p>
                There are no clinics available right now.
                If you require immediate assistance call your local health hotline.
            </p>
        );
    }

    return (
        <div className="text-white flex justify-center">
            <ul className="grid grid-cols-1 gap-4">
                <h1 className="text-4xl text-center text-green-900 mb-8 pb-4 border-b-2 border-gray-300">Choose a Clinic</h1>
                {clinics.map(clinic => (
                    clinic.doctors.length > 0 && ( // Only display a clinic if it has doctors working there.
                        <li key={clinic.id}>
                            <a href={`/book/${clinic.id}`}>
                                <div className="p-3 hover:bg-gray-100 transition duration-300">
                                    <h1 className="text-lg font-semibold text-green-800 mb-1">{clinic.name}</h1>
                                    <p className="text-sm text-green-800 mb-2">{clinic.address}</p>
                                    <div className="bg-green-900 text-center py-2 hover:bg-green-700 transition duration-300 rounded-full">
                                    <span className="text-sm text-white">Book Appointment</span>
                                    </div>
                                </div>
                            </a>
                        </li>
                    )
                ))}
            </ul>
        </div>
    );
};

export { ClinicBookingList };
