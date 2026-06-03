// One session ID per page-load (memory only -- no localStorage required)
export const SESSION_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
