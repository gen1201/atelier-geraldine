export function isAdmin(req) {
  const pin = req.headers['x-admin-pin'];
  return !!process.env.ADMIN_PIN && pin === process.env.ADMIN_PIN;
}
