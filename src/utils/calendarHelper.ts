export function getGoogleCalendarUrl(): string {
  const title = encodeURIComponent('Aniversário Super Mario - Zé da Piscina');
  const details = encodeURIComponent(
    'Venha comemorar comigo o meu aniversário no estilo Super Mario!\n' +
    'Local: Zé da piscina\n' +
    'Horário: 10:00\n' +
    'Dica: Não esqueça roupa de banho para a piscina!\n\n' +
    'Sugestão de presentes:\n' +
    '- Roupa: 6 anos e 8 anos\n' +
    '- Calçado: 30/31\n' +
    '- Perfume'
  );
  const location = encodeURIComponent('Zé da Piscina');
  // 28 Nov 10:00 to 18:00
  const dates = '20261128T130000Z/20261128T210000Z'; // UTC approximation

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
}

export function downloadIcsFile(): void {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Convite Super Mario//PT-BR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'SUMMARY:Aniversário Super Mario - Zé da Piscina',
    'DESCRIPTION:Venha comemorar comigo o meu aniversário! Local: Zé da piscina. Horário: 10h. Traje de banho recomendado.',
    'LOCATION:Zé da Piscina',
    'DTSTART:20261128T100000',
    'DTEND:20261128T180000',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'aniversario-super-mario.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
