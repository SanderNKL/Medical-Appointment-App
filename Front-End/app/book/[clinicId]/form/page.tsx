'use client';

import { useState, useEffect } from 'react';

import CryptoJS from 'crypto-js';

import { fetchData } from '@/lib/api';
import { formatDate } from '@/lib/formatDate';
import { BASE_API_URL } from '@/lib/constants';

import Loading from '@/components/Loading';
import ErrorMessage from '@/components/Error';
import BookingConfirmation from '@/components/BookingConfirmationScreen';
import UnavailableMessage from '@/components/BookingAvailabilityScreen';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


type Props = {
    params: { clinicId: string };
    searchParams: { [key: string]: string | string[] | undefined };
};

interface PatientFormData {
    SSN: string;
    firstName: string;
    lastName: string;
    birthdate: string;
    gender: string;
    note: string;
}

const encryptAndHashSSN = async (ssn: string) => {
    console.log(`hashing ${ssn}`)
    const hashedSSN = CryptoJS.SHA256(ssn).toString(CryptoJS.enc.Hex);
    console.log(`success hashed ${ssn} to ${hashedSSN}`)
    return hashedSSN;
}

const checkDatabaseForSSN = async (hashedSSN: string) => {
    try {
        const result = await fetchData(`/Patient/BySSN?ssn=${hashedSSN}`);
        return result;
    } catch {
        return null;
    }
};

const validateBooking = async (clinicId: number, doctorId: number, dateString: string) => {
    try {
        const result = await fetchData(`/Appointment/DoctorAvailableAppointment?clinicId=${clinicId}&doctorId=${doctorId}&date=${dateString}`);
        return result;
    } catch {
        return null;
    }
};

const createPatient = async (formData: PatientFormData) => {
    try {
        const hashedSSN = await encryptAndHashSSN(formData.SSN);
        console.log(`Creating  patient with this hash: ${hashedSSN}`)
        const response = await fetch(`${BASE_API_URL}/Patient?hashedSSN=${hashedSSN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
        return response;

    } catch (err) {
        console.log(err)
        return null;
    };
};

export default function ClinicBookingPage({ params, searchParams }: Props) {
    const { clinicId } = params;
    const doctorId = Array.isArray(searchParams.doctorId) ? searchParams.doctorId[0] : searchParams.doctorId;
    const date = Array.isArray(searchParams.date) ? searchParams.date[0] : searchParams.date;

    // Patient Form
    const [formData, setFormData] = useState<PatientFormData>({
        SSN: '',
        firstName: '',
        lastName: '',
        birthdate: '',
        gender: '',
        note: ''
    });

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | undefined>();
    const [patientDetails, setPatientDetails] = useState<any>(null);
    const [bookingAvailability, setBookingAvailability] = useState<boolean>(true);
    const [bookingConfirmation, setBookingConfirmation] = useState<boolean>(false);

    // Don't show a valid booking form if the date is invalid
    useEffect(() => {
        const checkAvailability = async () => {
            if (clinicId && doctorId && date) {
                const availableSlots = await validateBooking(parseInt(clinicId), parseInt(doctorId), date);
                if (!availableSlots || availableSlots.length === 0) {
                    setBookingAvailability(false);
                    setTimeout(() => {
                        window.location.href = `/book/${clinicId}`;
                    }, 6000);
                } else {
                    setBookingAvailability(true)
                    setLoading(false)
                }
            } else {
                setBookingAvailability(false);
                setTimeout(() => {
                    window.location.href = `/book/${clinicId}`;
                }, 6000);
            }
            setLoading(false);
        };

        checkAvailability();
    }, [clinicId, doctorId, date]);

    const bookAppointment = async (
        patientId: string,
        doctorId: string,
        clinicId: string,
        date: string,
        note: string
    ) => {
        try {
            setLoading(true)
            const response = await fetch(`${BASE_API_URL}/Appointment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    patientId,
                    doctorId,
                    clinicId,
                    date,
                    note
                }),
            });

            // Done processing API. Disable Loading Screen
            setLoading(false)

            if (response.ok) {
                const responseData = await response.json();
                setBookingConfirmation(true)
                return responseData;
            } else {
                toast.error(`Failed to book an appointment. Someone else seem to have booked before you. Redirecting you back...`);
                setTimeout(() => {
                    window.location.href = `/book/${clinicId}`;
                }, 6000);
            }
        } catch (error) {
            toast.error(`${error}`);
        }
    };

    const validateBirthday = (date: string) => {
        const ageLimit = 150;

        // Ensure the date is filled
        if (!date) {
            return false
        }
        
        // Convert to usable dates
        const dateToValidate = new Date(Date.parse(date))
        const dateNow = new Date(Date.now())

        // Date is from the future
        if (dateToValidate > dateNow) {
            return false;
        }

        // Check if the date is lower than the age limit years
        if (dateToValidate.getFullYear() < dateNow.getFullYear() - ageLimit) {
            return false;
        }

        return true;
    }

    const handleBooking = async () => {
        if (
            doctorId &&
            clinicId &&
            date
        ) {
            // Deifne constraints
            const minSSNLength = 6
            const maxSSNLenght = 20

            // Validate against constraints
            if (!formData.SSN || formData.SSN.length > maxSSNLenght || formData.SSN.length < minSSNLength) {
                toast.error(`Please enter a valid Social Security Number between ${minSSNLength}-${maxSSNLenght}.`);
                return;
            }

            // Test that the SSN is only numbers
            const isValidSSN = /^\d+$/.test(formData.SSN);
            if (!isValidSSN) {
                toast.error('Please enter a valid Social Security Number (only numbers allowed)');
                return;
            }

            // Check that the date is valid.
            const availableSlots = await validateBooking(parseInt(clinicId), parseInt(doctorId), date);
 
            if (!availableSlots || availableSlots.length === 0) {
                setBookingAvailability(false)
                setTimeout(() => {
                    window.location.href = `/book/${clinicId}`;
                }, 6000);
                return;
            }

            if (patientDetails) {
                return bookAppointment(
                    patientDetails.id,
                    doctorId,
                    clinicId,
                    date,
                    formData.note
                );
            }

            // Check if a patient is being registered
            if (
                formData.SSN &&
                formData.firstName &&
                formData.lastName &&
                formData.birthdate &&
                formData.gender
            ) { 
                const response = await createPatient(formData);

                if (response && response.ok) {
                    const patientData = await response.json();

                    if (patientData) {
                        return bookAppointment(
                            patientData.id,
                            doctorId,
                            clinicId,
                            date,
                            formData.note
                        );
                    }
                }
            }
            
            if (!validateBirthday(formData.birthdate)) {
                return toast.error("Enter a valid birthdate.");
            }

            // All fields must be filled in
            toast.error("Please fill in all of the required information in the form.")
        }
    };

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

    // Redirect if no available slots
    if (!bookingAvailability) {
        return (
            <UnavailableMessage />
        );
    }

    // Display a booking confirmation if they succeeded.
    if (bookingConfirmation) {
        return (
            <BookingConfirmation />
        );
    }

    // Function updates the form which will be sent to the API.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSSNChange = async (ssn: string) => {
        try {
            // Store the SSN
            setFormData({
                ...formData,
                'SSN': ssn
            });

            // Check if the hashed SSN exists in the database
            const hashedSSN = await encryptAndHashSSN(ssn);
            const patientDetails = await checkDatabaseForSSN(hashedSSN);

            // If patient details are found, set them in state
            if (patientDetails) {
                setPatientDetails(patientDetails);
            } else {
                // Clear patient details if SSN is not found
                setPatientDetails(null);
            }
        } catch (error) {
            setError('An error occurred while processing your request.');
        }
    };

    return (
        <div className="pt-16 flex justify-center items-center">
            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
                <h1 className="text-4xl text-center text-green-900 mb-8 pb-4 border-b-2 border-gray-300">Book an Appointment</h1>
                
                <div className="mb-4 relative">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ssn">
                        Social Security Number
                        <span className="text-red-500"> *</span>
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
                        id="SSN"
                        type="number"
                        onChange={(e) => handleSSNChange(e.target.value)}
                        required
                    />
                </div>


                {!patientDetails && (
                    <div className="border rounded p-4 mb-4">
                        <>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                                    First Name
                                    <span className="text-red-500"> *</span>
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="firstName"
                                    type="text"
                                    placeholder="Enter First Name"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                                    Last Name
                                    <span className="text-red-500"> *</span>
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="lastName"
                                    type="text"
                                    placeholder="Enter Last Name"
                                    onChange={handleChange}
                                    required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="birthdate">
                                        Birthdate
                                        <span className="text-red-500"> *</span>
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="birthdate"
                                        type="date"
                                        placeholder="Enter Birthdate (YYYY-MM-DD)"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gender">
                                        Gender
                                        <span className="text-red-500"> *</span>
                                    </label>
                                    <select
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="gender"
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                        </>
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                        Booking Date
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight focus:outline-none focus:shadow-outline"
                        id="date"
                        type="text"
                        value={formatDate(date) || ''}
                        readOnly
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="note">
                        Note
                    </label>
                    <textarea
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="note"
                        placeholder="Describe your symptoms"
                        onChange={handleChange}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <button
                        className="bg-green-900 hover:bg-green-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="button"
                        onClick={handleBooking}
                    >
                        Book Appointment
                    </button>
                </div>
            </form>
            <div>
                <ToastContainer />
            </div>
        </div>
    );
}
