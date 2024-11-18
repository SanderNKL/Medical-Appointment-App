'use client';

import { useEffect, useState } from 'react';

import { fetchData } from '@/lib/api';

import { Clinic } from '@/components/Booking';
import BackButton from '@/components/BackButton';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/Error';
import CalendarUI from '@/components/Calendar';


type Props = {
  params: { clinicId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function ClinicBookingPage({ params, searchParams }: Props) {
    const [clinic, setClinic] = useState<Clinic | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        const fetchClinic = async () => {
          try {
            const data = await fetchData(`/clinic/${params.clinicId}`);
            setClinic(data);
            setLoading(false);
          } catch (err) {
            const errorObj = err as Error;
            setError(errorObj.message);
            setLoading(false);
          }
        };
    
        fetchClinic();
      }, [params.clinicId]);

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

    if (clinic && clinic.doctors.length < 1) {
        return (
            <div className="pt-16">
                <div className="text-white flex justify-center">
                    <ul className="grid grid-cols-1 gap-4">
                        <h1 className="text-4xl text-center text-green-900 mb-8 pb-4 border-b-2 border-gray-300">Choose a Doctor</h1>
                        <div className="flex justify-center items-center h-full">
                            <div className="border-l-4 border-red-500 text-red-700 p-4 shadow-lg rounded-lg w-96">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 100 2 1 1 0 000-2zM9 9h2v4H9V9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-lg leading-6 font-medium text-red-900">No Doctors Available</h3>
                                        <div className="mt-2 text-sm text-gray-700">
                                            <p className="mb-4">No doctors are available at this clinic at this time. You may try visiting another clinic. In case of emergency, call your local emergency number.</p>
                                            <a href="/" className="bg-green-900 hover:bg-green-800 text-white font-bold py-2 px-4 rounded">
                                                Return Home
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ul>
                </div>
            </div>
        );
    }
    return (
        <div className="pt-16 flex flex-col items-center">
          <div className="text-white flex justify-center">
            <ul className="grid grid-cols-1 gap-4">
              <h1 className="text-4xl text-center text-green-900">Choose a Doctor</h1>
              <h2 className="text-2xl text-center text-green-900 mb-8 pb-4 border-b-2 border-gray-300">{clinic ? clinic.name : 'This Clinic is no longer Available'}</h2>
              <BackButton link={`/`} />
            </ul>
          </div>
          <div className="flex-grow w-full max-w-screen-lg mb-8"> 
            <CalendarUI clinicId={params.clinicId}/>
          </div>
          <div className="flex-grow"></div>
        </div>
    );
      
}

