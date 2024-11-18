'use client';

import { useState, useEffect } from 'react';
import { fetchData } from '@/lib/api';

import Loading from '@/components/Loading';
import ErrorMessage from '@/components/Error';

interface Speciality {
    id: number;
    name: string;
}

interface Clinic {
    id: number;
    name: string;
    address: string;
}

interface Doctor {
    firstName: string;
    lastName: string;
    speciality: Speciality;
    clinic: Clinic;
}

export default function DoctorSearchPage() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | undefined>();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        const fetchDoctors = async () => {
            setLoading(true);
            const allDoctors = await getAllDoctors();
            setDoctors(allDoctors);
            setLoading(false);
        };

        fetchDoctors();
    }, []);


    const getAllDoctors = async () => {
        try {
            const result = await fetchData(`/Doctor`);
            return result || [];
        } catch {
            return [];
        }
    };

    const getDoctorsByName = async (name: string) => {
        try {
            const result = await fetchData(`/Doctor/SearchMany?name=${name}`);
            console.log(result)
            return result || [];
        } catch {
            return [];
        }
    };

    const handleNameSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setSearchTerm(name);

        setLoading(true);
        if (name.length < 1) {
            const allDoctors = await getAllDoctors();
            setDoctors(allDoctors);
        } else {
            const doctorsByName = await getDoctorsByName(name);
            setDoctors(doctorsByName);
        }
        setLoading(false);
    };

    return (
        <div className="pt-16 flex flex-col justify-center items-center">
            <input
                type="text"
                value={searchTerm}
                onChange={handleNameSearchChange}
                placeholder="Search doctors by name"
                className="mb-4 p-2 border border-gray-300 rounded"
            />
            {error && <ErrorMessage error={error} />}
            <div className="w-full max-w-md">
                {loading && <Loading />}
                {!loading && doctors.length > 0 ? (
                    doctors.map((doctor, index) => (
                        <div key={index} className="border-b p-4">
                            <h2 className="text-xl text-green-800 font-bold">{doctor.firstName} {doctor.lastName}</h2>
                            <p className="text-gray-700">Speciality: {doctor.speciality.name}</p>
                            <p className="text-gray-700">Clinic: {doctor.clinic.name}, {doctor.clinic.address}</p>
                        </div>
                    ))
                ) : (
                    !loading && <p>No doctor(s) with that name were found.</p>
                )}
            </div>
        </div>
    );
}
