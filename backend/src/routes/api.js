import { Router } from 'express';
import { authenticateToken, requireRole } from '../middlewares/auth.js';
import { uploadPoster } from '../middlewares/upload.js';
import * as authCtrl from '../controllers/authController.js';
import * as eventCtrl from '../controllers/eventController.js';
import * as regCtrl from '../controllers/registrationController.js';
import * as attCtrl from '../controllers/attendanceController.js';
import * as certCtrl from '../controllers/certificateController.js';
import * as adminCtrl from '../controllers/adminController.js';

const router = Router();

// --- 1. Autentikasi Pengguna & Penyelenggara ---
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', authenticateToken, authCtrl.getMe);

// --- 2. Kategori Kegiatan ---
router.get('/categories', adminCtrl.getCategories);
router.post('/categories', authenticateToken, requireRole('admin'), adminCtrl.createCategory);

// --- 3. Events & Kalender Publik (Mendukung Upload Poster Multipart) ---
router.get('/events', eventCtrl.getEvents);
router.get('/events/:id', eventCtrl.getEventById);
router.post('/events', authenticateToken, requireRole(['admin', 'organizer']), uploadPoster.single('poster'), eventCtrl.createEvent);
router.delete('/events/:id', authenticateToken, requireRole(['admin', 'organizer']), eventCtrl.deleteEvent);

// --- 4. Staf Scanner Panitia (Kelola Panitia Scanner Meja Registrasi) ---
router.get('/events/:eventId/scanners', authenticateToken, requireRole(['admin', 'organizer']), eventCtrl.getEventScanners);
router.post('/events/:eventId/scanners', authenticateToken, requireRole(['admin', 'organizer']), eventCtrl.addEventScanner);
router.delete('/scanners/:scannerId', authenticateToken, requireRole(['admin', 'organizer']), eventCtrl.deleteEventScanner);

// --- 5. Registrasi Tanpa Login (Zero Friction) & Pencarian Tiket Publik ---
router.post('/events/:id/register-public', regCtrl.registerPublicToEvent);
router.get('/tickets/lookup', regCtrl.lookupPublicTickets);
router.get('/user/my-tickets', authenticateToken, regCtrl.getMyTickets);
router.delete('/registrations/:id', regCtrl.cancelRegistration);

// --- 6. Presensi Barcode / QR Code (Multi-Scanner Real-Time + Audit Trail) ---
router.post('/attendances/verify-scanner', attCtrl.verifyScannerStaff);
router.post('/attendances/scan', attCtrl.scanAttendance);
router.get('/events/:eventId/spreadsheet', attCtrl.getEventAttendanceSpreadsheet);
router.get('/events/:eventId/export-excel', attCtrl.exportAttendanceExcel);

// --- 7. E-Sertifikat PDF Sah Ber-QR ---
router.post('/events/:eventId/issue-certificates', authenticateToken, requireRole(['admin', 'organizer']), certCtrl.issueCertificates);
router.get('/certificates/public/:registrationId/download', certCtrl.downloadCertificatePublic);
router.get('/certificates/:registrationId/download', certCtrl.downloadCertificatePublic);
router.get('/certificates/verify/:verifyCode', certCtrl.verifyCertificate);

// --- 8. Admin 1-Click Generate Akun UKM & Analytics ---
router.get('/admin/stats', authenticateToken, requireRole('admin'), adminCtrl.getAdminStats);
router.post('/admin/generate-organizer', authenticateToken, requireRole('admin'), adminCtrl.generateOrganizerAccount);
router.patch('/admin/organizations/:id/verify', authenticateToken, requireRole('admin'), adminCtrl.verifyOrganization);
router.get('/organizer/analytics', authenticateToken, requireRole(['admin', 'organizer']), adminCtrl.getOrganizerAnalytics);

export default router;
