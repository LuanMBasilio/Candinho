// weekDay nos dados: 1 = domingo ... 7 = sábado (Date#getDay() + 1)
export const WEEK_DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function getStatus(schedules, now = new Date()) {
  const today = now.getDay() + 1
  const minutes = now.getHours() * 60 + now.getMinutes()

  const todaySchedule = schedules.find((s) => s.weekDay === today)
  if (todaySchedule && minutes >= toMinutes(todaySchedule.start) && minutes < toMinutes(todaySchedule.end)) {
    return { open: true, label: `Aberto até ${todaySchedule.end}` }
  }

  // Próxima abertura (hoje mais tarde ou nos próximos dias)
  for (let offset = 0; offset < 7; offset++) {
    const day = ((today - 1 + offset) % 7) + 1
    const s = schedules.find((x) => x.weekDay === day)
    if (!s) continue
    if (offset === 0 && minutes >= toMinutes(s.start)) continue
    const when = offset === 0 ? 'hoje' : offset === 1 ? 'amanhã' : WEEK_DAYS[day - 1].toLowerCase()
    return { open: false, label: `Fechado · abre ${when} às ${s.start}` }
  }
  return { open: false, label: 'Fechado' }
}

export function weeklyHours(schedules) {
  return WEEK_DAYS.map((name, i) => {
    const s = schedules.find((x) => x.weekDay === i + 1)
    return { name, hours: s ? `${s.start} às ${s.end}` : 'Fechado', today: new Date().getDay() === i }
  })
}
