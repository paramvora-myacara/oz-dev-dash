import { fromZonedTime, toZonedTime } from 'date-fns-tz'

export interface ScheduleConfig {
  timezone: string
  workingHourStart: number
  workingHourEnd: number
  skipWeekends?: boolean
}

function createDateInTimezone(
  timezone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number
): Date {
  const localDate = new Date(year, month, day, hour, minute, second)
  return fromZonedTime(localDate, timezone)
}

function nextWeekdayStart(
  zonedTime: Date,
  { timezone, workingHourStart, skipWeekends }: ScheduleConfig
): Date {
  const next = new Date(zonedTime.getFullYear(), zonedTime.getMonth(), zonedTime.getDate())
  next.setDate(next.getDate() + 1)

  // Advance past weekend if needed
  if (skipWeekends) {
    while (next.getDay() === 0 || next.getDay() === 6) {
      next.setDate(next.getDate() + 1)
    }
  }

  return createDateInTimezone(
    timezone,
    next.getFullYear(),
    next.getMonth(),
    next.getDate(),
    workingHourStart,
    0,
    0
  )
}

export function getStartTimeInTimezone(config: ScheduleConfig): Date {
  const { timezone, workingHourStart, workingHourEnd, skipWeekends } = config
  const now = new Date()
  const zonedTime = toZonedTime(now, timezone)
  const { year, month, day, hour, minute, second } = {
    year: zonedTime.getFullYear(),
    month: zonedTime.getMonth(),
    day: zonedTime.getDate(),
    hour: zonedTime.getHours(),
    minute: zonedTime.getMinutes(),
    second: zonedTime.getSeconds(),
  }

  // If weekend, start next weekday at start hour
  if (skipWeekends && (zonedTime.getDay() === 0 || zonedTime.getDay() === 6)) {
    return nextWeekdayStart(zonedTime, config)
  }

  if (hour < workingHourStart) {
    return createDateInTimezone(timezone, year, month, day, workingHourStart, 0, 0)
  } else if (hour >= workingHourEnd) {
    return nextWeekdayStart(zonedTime, config)
  } else {
    return createDateInTimezone(timezone, year, month, day, hour, minute, second)
  }
}

export function adjustToWorkingHours(candidateTime: Date, config: ScheduleConfig): Date {
  const { timezone, workingHourEnd, skipWeekends } = config
  const zonedTime = toZonedTime(candidateTime, timezone)

  // Weekend => next weekday 9am (or configured start)
  if (skipWeekends && (zonedTime.getDay() === 0 || zonedTime.getDay() === 6)) {
    return nextWeekdayStart(zonedTime, config)
  }

  const boundary5pm = createDateInTimezone(
    timezone,
    zonedTime.getFullYear(),
    zonedTime.getMonth(),
    zonedTime.getDate(),
    workingHourEnd,
    0,
    0
  )

  if (candidateTime >= boundary5pm) {
    return nextWeekdayStart(zonedTime, config)
  }

  return candidateTime
}
