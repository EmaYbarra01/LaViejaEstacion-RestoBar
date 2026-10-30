const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export const formatClockDate = (date) => `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;

export const formatClockTime = (date) => {
    const hours = date.getHours();
    const pad = (value) => String(value).padStart(2, '0');
    return `${pad(hours % 12 || 12)}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${hours < 12 ? 'a. m.' : 'p. m.'}`;
};
