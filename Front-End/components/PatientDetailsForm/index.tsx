import React, { useEffect, useState } from 'react';

import { fetchData } from '@/lib/api';

interface PatientDetailsProps {
    ssn: string;
}

interface PatientDetails {
    id: number;
    firstName: string;
    lastName: string;
    birthdate: string;
    gender: string;
}

interface FormValues {
    firstName: string;
    lastName: string;
    birthdate: string;
    gender: string;
}

const PatientDetailsForm: React.FC<PatientDetailsProps> = ({ ssn }) => {
    const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
    const [formValues, setFormValues] = useState<FormValues>({
        firstName: '',
        lastName: '',
        birthdate: '',
        gender: '',
    });

    const encryptAndHashSSN = async (ssn: string) => {
        return ssn;
    };

    const checkDatabaseForSSN = async (ssn: string) => {
        try {
            const hashedSSN = encryptAndHashSSN(ssn);
            const result = await fetchData(`/Patient/BySSN?ssn=${hashedSSN}`);
            console.log(result)
            return result;
        } catch {
            return null;
        }
    };

    useEffect(() => {
        const fetchPatientDetails = async () => {
            try {
                const response = await checkDatabaseForSSN(ssn);
                if (response.data) {
                    setPatientDetails(response.data);
                    setFormValues({
                        firstName: response.data.firstName,
                        lastName: response.data.lastName,
                        birthdate: new Date(response.data.birthdate).toISOString().split('T')[0],
                        gender: response.data.gender,
                    });
                }
            } catch (error) {
                console.error("Error fetching patient details", error);
            }
        };

        fetchPatientDetails();
    }, [ssn]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormValues({
            ...formValues,
            [id]: value
        });
    };

    return (
        <div>
            {patientDetails ? (
                <>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                            First Name
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="firstName"
                            type="text"
                            value={formValues.firstName}
                            readOnly
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                            Last Name
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="lastName"
                            type="text"
                            value={formValues.lastName}
                            readOnly
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="birthdate">
                            Birthdate
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="birthdate"
                            type="text"
                            value={new Date(formValues.birthdate).toLocaleDateString()}
                            readOnly
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gender">
                            Gender
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="gender"
                            type="text"
                            value={formValues.gender}
                            readOnly
                        />
                    </div>
                </>
            ) : (
                <>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                            First Name
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="firstName"
                            type="text"
                            value={formValues.firstName}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                            Last Name
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="lastName"
                            type="text"
                            value={formValues.lastName}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="birthdate">
                            Birthdate
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="birthdate"
                            type="date"
                            value={formValues.birthdate}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gender">
                            Gender
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="gender"
                            type="text"
                            value={formValues.gender}
                            onChange={handleInputChange}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default PatientDetailsForm;
