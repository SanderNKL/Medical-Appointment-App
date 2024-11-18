export function formatDate(dateString: string | undefined): string {
    if (!dateString) {
        return 'No date found.';
    }

    // Convert string date to usable date
    const date = new Date(dateString);

    // Get the month and date from new date
    const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
    const day = date.getDate();
    
    // Return a Readable format for the patients
    return `${month} ${day}`;
}