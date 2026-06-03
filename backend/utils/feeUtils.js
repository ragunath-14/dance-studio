/**
 * Shared billing helpers — keep fee and cycle math identical across API, scheduler, and alerts.
 */

const getMonthlyFee = (student) => {
  if (student?.fee > 0) return student.fee;
  const ageNum = parseStudentAge(student?.studentAge);
  if (ageNum === null) return 2500;
  return ageNum <= 9 ? 1500 : 2500;
};

const parseStudentAge = (studentAge) => {
  const raw = String(studentAge ?? '').trim();
  if (!raw) return null;
  const ageNum = parseInt(raw, 10);
  return Number.isFinite(ageNum) ? ageNum : null;
};

const getBillingCycles = (joinDate, today = new Date()) => {
  const jd = new Date(joinDate);
  if (Number.isNaN(jd.getTime())) return 0;

  let totalCycles =
    (today.getFullYear() - jd.getFullYear()) * 12 +
    (today.getMonth() - jd.getMonth()) +
    1;

  if (today.getDate() < jd.getDate()) totalCycles--;
  return Math.max(0, totalCycles);
};

const calculateDues = (student, totalPaid = 0, today = new Date()) => {
  const joinDate = new Date(student.createdAt || student.joinDate);
  const totalCycles = getBillingCycles(joinDate, today);
  const fee = getMonthlyFee(student);

  if (totalCycles <= 0) {
    return { totalCycles: 0, fee, totalExpected: 0, totalDue: 0, pendingMonths: 0, isPaid: true };
  }

  const totalExpected = totalCycles * fee;
  const totalDue = Math.max(0, totalExpected - totalPaid);
  const pendingMonths = totalDue > 0 ? Math.ceil(totalDue / fee) : 0;

  return {
    totalCycles,
    fee,
    totalExpected,
    totalDue,
    pendingMonths,
    isPaid: totalDue <= 0,
  };
};

module.exports = {
  getMonthlyFee,
  parseStudentAge,
  getBillingCycles,
  calculateDues,
};
