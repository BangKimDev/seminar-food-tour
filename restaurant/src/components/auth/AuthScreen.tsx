import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SystemUser } from '../../types';
import { authService } from '../../services/authService';

type AuthMode = 'login' | 'register';

interface AuthScreenProps {
  onLogin: (user: SystemUser) => void;
}

interface DialogConfig {
  visible: boolean;
  title: string;
  message: string;
  type: 'error' | 'success';
}

const ForkKnifeLogo = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 4V14M8 20V32M8 14C6 14 4 12 4 10V6C4 4 6 4 8 4M8 14C10 14 12 12 12 10V6C12 4 10 4 8 4" stroke="#E8A838" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M24 4V12C24 16 28 16 28 12V4M26 4V32" stroke="#E8A838" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="28" cy="22" r="6" stroke="#E8A838" strokeWidth="1.5" fill="none"/>
    <path d="M25 22H31" stroke="#E8A838" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M28 19V25" stroke="#E8A838" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const EnvelopeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 4L8 8.5L14 4" stroke="#2A2A2A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.35"/>
    <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="#2A2A2A" strokeWidth="1.2" opacity="0.35"/>
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="5.5" r="2.5" stroke="#2A2A2A" strokeWidth="1.2" opacity="0.35"/>
    <path d="M3 14C3 11.5 5.2 10 8 10C10.8 10 13 11.5 13 14" stroke="#2A2A2A" strokeWidth="1.2" strokeLinecap="round" opacity="0.35"/>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3.5" y="7" width="9" height="7" rx="1.5" stroke="#2A2A2A" strokeWidth="1.2" opacity="0.35"/>
    <path d="M5 7V5C5 3 6 2 8 2C10 2 11 3 11 5V7" stroke="#2A2A2A" strokeWidth="1.2" strokeLinecap="round" opacity="0.35"/>
  </svg>
);

const UtensilsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 2V7M4 9V14M4 7C3 7 2 6 2 5V3.5C2 2.5 3 2 4 2M4 7C5 7 6 6 6 5V3.5C6 2.5 5 2 4 2" stroke="#2A2A2A" strokeWidth="1.2" strokeLinecap="round" opacity="0.35"/>
    <path d="M11 2V6C11 8 13 8 13 6V2M12 2V14" stroke="#2A2A2A" strokeWidth="1.2" strokeLinecap="round" opacity="0.35"/>
  </svg>
);

const EyeIcon = ({ visible }: { visible: boolean }) => (
  visible ? (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 8C2 8 4 3 8 3C12 3 14 8 14 8C14 8 12 13 8 13C4 13 2 8 2 8Z" stroke="#2A2A2A" strokeWidth="1.2" opacity="0.35"/>
      <circle cx="8" cy="8" r="2" stroke="#2A2A2A" strokeWidth="1.2" opacity="0.35"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3L13 13" stroke="#2A2A2A" strokeWidth="1.2" strokeLinecap="round" opacity="0.35"/>
      <path d="M6.5 6.5C6 7 5.5 8 5.5 8.5C5.5 9.5 6.5 11 8 11C8.5 11 9 10.8 9.5 10.5" stroke="#2A2A2A" strokeWidth="1.2" strokeLinecap="round" opacity="0.35"/>
      <path d="M2.5 8C2.5 8 4 4 8 4C9 4 10 4.3 11 5" stroke="#2A2A2A" strokeWidth="1.2" strokeLinecap="round" opacity="0.35"/>
      <path d="M13.5 8C13.5 8 12 12 8 12C7.5 12 7 11.9 6.5 11.8" stroke="#2A2A2A" strokeWidth="1.2" strokeLinecap="round" opacity="0.35"/>
    </svg>
  )
);

// ─── Dialog ───────────────────────────────────────────────

const Dialog = ({ config, onClose }: { config: DialogConfig; onClose: () => void }) => (
  <AnimatePresence>
    {config.visible && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-sm bg-warm shadow-2xl border-l-[3px] ${config.type === 'error' ? 'border-red-500' : 'border-emerald-500'}`}
        >
          <div className="p-6">
            <div className="flex items-start gap-3">
              <div className={`shrink-0 w-8 h-8 flex items-center justify-center ${config.type === 'error' ? 'bg-red-50' : 'bg-emerald-50'}`}>
                {config.type === 'error' ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="6" stroke="#DC2626" strokeWidth="1.3"/>
                    <path d="M8 5V9" stroke="#DC2626" strokeWidth="1.3" strokeLinecap="round"/>
                    <circle cx="8" cy="11" r="0.7" fill="#DC2626"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="6" stroke="#059669" strokeWidth="1.3"/>
                    <path d="M5.5 8L7.5 10L10.5 6" stroke="#059669" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-sans text-sm font-bold text-charcoal mb-1">
                  {config.title}
                </h3>
                <p className="font-sans text-[13px] text-charcoal/60 leading-relaxed">
                  {config.message}
                </p>
              </div>
            </div>
          </div>
          <div className="px-6 pb-5">
            <button
              onClick={onClose}
              className={`font-sans w-full py-2.5 text-sm font-semibold transition-all active:translate-y-[1px] ${config.type === 'error' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
            >
              {config.type === 'error' ? 'Đã hiểu' : 'Tiếp tục'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Left Panel ──────────────────────────────────────────

const LeftPanel = ({ mode }: { mode: AuthMode }) => (
  <div className="relative md:w-[55%] bg-forest noise-overlay pattern-motif flex flex-col justify-between p-10 lg:p-14 overflow-hidden">
    <div className="absolute inset-0 lantern-glow pointer-events-none z-[2]" />
    <div className="absolute top-0 left-0 right-0 h-[3px] bg-amber z-10" />

    <div className="relative z-[3]">
      <div className="mb-2">
        <ForkKnifeLogo />
      </div>
      <h1 className="font-serif text-4xl lg:text-5xl font-bold text-warm leading-tight tracking-tight">
        FoodStreet
      </h1>
      <p className="font-serif text-amber text-xl lg:text-2xl italic font-light -mt-1">
        Manager
      </p>
      <span className="inline-block mt-5 text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-amber/70 border border-amber/30 px-3 py-1.5">
        Dành cho chủ hộ kinh doanh
      </span>
    </div>

    <div className="relative z-[3] mt-12 lg:mt-16">
      <div className="space-y-6">
        <div className="animate-fade-slide-up">
          <p className="font-sans text-sm font-medium text-warm/90 leading-relaxed">
            <span className="text-amber mr-2">—</span>
            Quản lý menu món ăn linh hoạt
          </p>
          <p className="font-sans text-xs text-warm/40 mt-1 ml-5 leading-relaxed max-w-[280px]">
            Cập nhật thực đơn, giá cả và hình ảnh món ăn dễ dàng
          </p>
        </div>
        <div className="animate-fade-slide-up-delay-1">
          <p className="font-sans text-sm font-medium text-warm/90 leading-relaxed">
            <span className="text-amber mr-2">—</span>
            Thuyết minh GPS tự động
          </p>
          <p className="font-sans text-xs text-warm/40 mt-1 ml-5 leading-relaxed max-w-[280px]">
            Khách quét QR là nghe giới thiệu về quán của bạn
          </p>
        </div>
        <div className="animate-fade-slide-up-delay-2">
          <p className="font-sans text-sm font-medium text-warm/90 leading-relaxed">
            <span className="text-amber mr-2">—</span>
            Báo cáo doanh thu đơn giản
          </p>
          <p className="font-sans text-xs text-warm/40 mt-1 ml-5 leading-relaxed max-w-[280px]">
            Theo dõi lượt ghé thăm và dữ liệu kinh doanh
          </p>
        </div>
      </div>
    </div>

    <div className="relative z-[3] mt-auto pt-10">
      <p className="font-serif text-warm/20 text-xs italic">
        Phố ẩm thực · Tinh hoa Việt
      </p>
    </div>
  </div>
);

// ─── Input component ──────────────────────────────────────

interface FieldProps {
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  required?: boolean;
}

const FormField = ({ label, placeholder, type = 'text', value, onChange, icon, rightIcon, onRightIconClick, required }: FieldProps) => (
  <div>
    <label className="font-sans text-[10px] font-semibold text-charcoal/50 uppercase tracking-[0.15em] block mb-1.5">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <span className="absolute left-0 bottom-2.5 pointer-events-none">{icon}</span>
      )}
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`font-sans w-full pb-2 pt-1 bg-transparent border-b border-charcoal/20 text-charcoal text-sm outline-none transition-all focus:border-amber placeholder:text-charcoal/25 ${icon ? 'pl-5' : 'px-0'}`}
      />
      {rightIcon && (
        <button
          type="button"
          onClick={onRightIconClick}
          className="absolute right-0 bottom-2.5 p-0 bg-transparent border-none cursor-pointer"
          tabIndex={-1}
        >
          {rightIcon}
        </button>
      )}
    </div>
  </div>
);

// ─── Validation helpers ───────────────────────────────────

interface ValidationError {
  field: string;
  message: string;
}

const validateRegister = (data: {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  restaurantName: string;
  detailAddress: string;
  description: string;
  cuisine: string;
  openingHours: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.email.trim()) errors.push({ field: 'Email', message: 'Vui lòng nhập email' });
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push({ field: 'Email', message: 'Email không đúng định dạng' });

  if (!data.username.trim()) errors.push({ field: 'Tài khoản', message: 'Vui lòng nhập tên đăng nhập' });
  else if (data.username.trim().length < 3) errors.push({ field: 'Tài khoản', message: 'Tên đăng nhập phải có ít nhất 3 ký tự' });

  if (!data.password) errors.push({ field: 'Mật khẩu', message: 'Vui lòng nhập mật khẩu' });
  else if (data.password.length < 6) errors.push({ field: 'Mật khẩu', message: 'Mật khẩu phải có ít nhất 6 ký tự' });

  if (!data.confirmPassword) errors.push({ field: 'Xác nhận mật khẩu', message: 'Vui lòng xác nhận mật khẩu' });
  else if (data.password !== data.confirmPassword) errors.push({ field: 'Xác nhận mật khẩu', message: 'Mật khẩu xác nhận không khớp' });

  if (!data.restaurantName.trim()) errors.push({ field: 'Tên quán ăn', message: 'Vui lòng nhập tên quán ăn' });
  else if (data.restaurantName.trim().length < 2) errors.push({ field: 'Tên quán ăn', message: 'Tên quán ăn phải có ít nhất 2 ký tự' });

  if (!data.detailAddress.trim()) errors.push({ field: 'Địa chỉ', message: 'Vui lòng nhập địa chỉ quán' });
  else if (data.detailAddress.trim().length < 5) errors.push({ field: 'Địa chỉ', message: 'Địa chỉ phải có ít nhất 5 ký tự' });

  return errors;
};

// ─── Login Form ───────────────────────────────────────────

interface LoginFormProps {
  onSuccess: (user: SystemUser) => void;
  onSwitch: () => void;
  showDialog: (config: Omit<DialogConfig, 'visible'>) => void;
}

const LoginForm = ({ onSuccess, onSwitch, showDialog }: LoginFormProps) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Vui lòng nhập email hoặc tên đăng nhập');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const result = await authService.login(identifier, password);
      authService.storeSession(result.token, result.user);
      onSuccess(result.user);
    } catch (err: any) {
      setError(err.message || 'Email/tài khoản hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="font-sans text-[10px] font-semibold text-charcoal/50 uppercase tracking-[0.15em] block mb-1.5">
          Email / Tài khoản
        </label>
        <input
          type="text"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Email hoặc tên đăng nhập"
          className="font-sans w-full px-0 pb-2 pt-1 bg-transparent border-b border-charcoal/20 text-charcoal text-sm outline-none transition-all focus:border-amber placeholder:text-charcoal/25"
        />
      </div>
      <div>
        <label className="font-sans text-[10px] font-semibold text-charcoal/50 uppercase tracking-[0.15em] block mb-1.5">
          Mật khẩu
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="font-sans w-full px-0 pb-2 pt-1 bg-transparent border-b border-charcoal/20 text-charcoal text-sm outline-none transition-all focus:border-amber placeholder:text-charcoal/25"
        />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-sans text-xs font-medium text-red-600 bg-red-50/80 px-3 py-2.5 border-l-2 border-red-400"
        >
          {error}
        </motion.div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="font-sans w-full py-3.5 px-6 bg-amber text-charcoal font-semibold text-sm tracking-wide transition-all hover:bg-amber/90 hover:shadow-lg hover:shadow-amber/25 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
        ) : (
          'Đăng nhập ngay'
        )}
      </button>

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onSwitch}
          className="font-sans text-[12px] text-charcoal/40 hover:text-amber transition-colors bg-transparent border-none cursor-pointer underline underline-offset-2 decoration-amber/30 hover:decoration-amber"
        >
          Chưa có tài khoản? → Đăng ký ngay
        </button>
      </div>

      <div className="border border-dashed border-charcoal/15 p-4">
        <p className="font-sans text-[9px] font-semibold text-charcoal/35 uppercase tracking-[0.2em] mb-2.5">
          Tài khoản trải nghiệm
        </p>
        <div className="flex items-center justify-between gap-4">
          <span className="font-sans text-[11px] text-charcoal/60">
            User: <span className="font-mono font-semibold text-charcoal/80">admin@foodstreet.vn</span>
            <span className="text-charcoal/30 mx-1">|</span>
            <span className="font-mono font-semibold text-charcoal/80">admin</span>
          </span>
          <span className="font-sans text-[11px] text-charcoal/60">
            Pass: <span className="font-mono font-semibold text-charcoal/80">123456</span>
          </span>
        </div>
      </div>
    </form>
  );
};

// ─── Register Form ────────────────────────────────────────

interface RegisterFormProps {
  onSwitch: () => void;
  onRegistered: () => void;
  showDialog: (config: Omit<DialogConfig, 'visible'>) => void;
}

const RegisterForm = ({ onSwitch, onRegistered, showDialog }: RegisterFormProps) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [description, setDescription] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const errors = validateRegister({ email, username, password, confirmPassword, restaurantName, detailAddress, description, cuisine, openingHours });

    if (errors.length > 0) {
      const messages = errors.map((err) => `• ${err.field}: ${err.message}`).join('\n');
      showDialog({
        type: 'error',
        title: 'Thông tin không hợp lệ',
        message: messages,
      });
      setLoading(false);
      return;
    }

    try {
      await authService.register(email, password, restaurantName, username, detailAddress, description, cuisine, openingHours);
      showDialog({
        type: 'success',
        title: 'Đăng ký thành công!',
        message: 'Tài khoản của bạn đã được tạo. Vui lòng đăng nhập để tiếp tục.',
      });
      onRegistered();
    } catch (err: any) {
      showDialog({
        type: 'error',
        title: 'Đăng ký thất bại',
        message: err.message || 'Có lỗi xảy ra, vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Email"
        placeholder="email@example.com"
        value={email}
        onChange={setEmail}
        icon={<EnvelopeIcon />}
        required
      />
      <FormField
        label="Tài khoản"
        placeholder="Tên đăng nhập"
        value={username}
        onChange={setUsername}
        icon={<UserIcon />}
        required
      />
      <FormField
        label="Mật khẩu"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        value={password}
        onChange={setPassword}
        icon={<LockIcon />}
        rightIcon={<EyeIcon visible={showPassword} />}
        onRightIconClick={() => setShowPassword(!showPassword)}
        required
      />
      <FormField
        label="Xác nhận mật khẩu"
        type={showConfirm ? 'text' : 'password'}
        placeholder="••••••••"
        value={confirmPassword}
        onChange={setConfirmPassword}
        icon={<LockIcon />}
        rightIcon={<EyeIcon visible={showConfirm} />}
        onRightIconClick={() => setShowConfirm(!showConfirm)}
        required
      />
      <FormField
        label="Tên quán ăn"
        placeholder="VD: Bún bò Mười Hai"
        value={restaurantName}
        onChange={setRestaurantName}
        icon={<UtensilsIcon />}
        required
      />

      <FormField
        label="Địa chỉ quán"
        placeholder="Số nhà, tên đường, hẻm..."
        value={detailAddress}
        onChange={setDetailAddress}
      />

      {/* Thông tin nhà hàng */}
      <div className="pt-2 pb-1">
        <span className="font-sans text-[9px] font-semibold text-charcoal/35 uppercase tracking-[0.2em]">
          Thông tin nhà hàng
        </span>
      </div>

      <div>
        <label className="font-sans text-[10px] font-semibold text-charcoal/50 uppercase tracking-[0.15em] block mb-1.5">
          Mô tả quán ăn
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Giới thiệu ngắn về quán ăn của bạn..."
          rows={3}
          className="font-sans w-full px-0 pb-2 pt-1 bg-transparent border-b border-charcoal/20 text-charcoal text-sm outline-none transition-all focus:border-amber placeholder:text-charcoal/25 resize-none"
        />
      </div>

      <FormField
        label="Loại ẩm thực"
        placeholder="VD: Việt Nam, Hàn Quốc..."
        value={cuisine}
        onChange={setCuisine}
      />

      <FormField
        label="Giờ mở cửa"
        placeholder="VD: 08:00 - 22:00"
        value={openingHours}
        onChange={setOpeningHours}
      />

      <button
        type="submit"
        disabled={loading}
        className="font-sans w-full py-3.5 px-6 bg-amber text-charcoal font-semibold text-sm tracking-wide transition-all hover:bg-amber/90 hover:shadow-lg hover:shadow-amber/25 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
        ) : (
          'Tạo tài khoản →'
        )}
      </button>

      <div className="text-center pt-1">
        <button
          type="button"
          onClick={onSwitch}
          className="font-sans text-[12px] text-charcoal/40 hover:text-amber transition-colors bg-transparent border-none cursor-pointer underline underline-offset-2 decoration-amber/30 hover:decoration-amber"
        >
          Đã có tài khoản? → Đăng nhập
        </button>
      </div>
    </form>
  );
};

// ─── AuthScreen (Main) ────────────────────────────────────

export const AuthScreen = ({ onLogin }: AuthScreenProps) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [direction, setDirection] = useState<1 | -1>(1);
  const [dialog, setDialog] = useState<DialogConfig>({ visible: false, title: '', message: '', type: 'error' });

  const showDialog = useCallback((config: Omit<DialogConfig, 'visible'>) => {
    setDialog({ ...config, visible: true });
  }, []);

  const closeDialog = useCallback(() => {
    setDialog((prev) => ({ ...prev, visible: false }));
  }, []);

  const switchToRegister = useCallback(() => {
    setDirection(1);
    setMode('register');
  }, []);

  const switchToLogin = useCallback(() => {
    setDirection(-1);
    setMode('login');
  }, []);

  const formVariants = {
    enter: (dir: number) => ({
      x: dir * 60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir * -60,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal p-4 sm:p-6">
      <div className="flex flex-col md:flex-row w-full max-w-5xl min-h-[640px] shadow-2xl overflow-hidden rounded-none">
        <LeftPanel mode={mode} />

        {/* Right Panel — Form (45%) */}
        <div className="md:w-[45%] bg-warm p-10 lg:p-14 flex flex-col justify-center relative">
          <div className="hidden md:block absolute top-0 left-0 w-[3px] h-full bg-amber/40" />

          <div className="max-w-sm mx-auto w-full overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {mode === 'login' ? (
                <motion.div
                  key="login"
                  custom={direction}
                  variants={formVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="mb-8">
                    <h2 className="font-sans text-xl font-bold text-charcoal mb-2">
                      Đăng nhập hệ thống
                    </h2>
                    <p className="font-sans text-sm text-charcoal/50">
                      Vui lòng nhập tài khoản quản lý của bạn
                    </p>
                  </div>
                  <LoginForm onSuccess={onLogin} onSwitch={switchToRegister} showDialog={showDialog} />
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  custom={direction}
                  variants={formVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="mb-8">
                    <h2 className="font-sans text-xl font-bold text-charcoal mb-2">
                      Tạo tài khoản mới
                    </h2>
                    <p className="font-sans text-sm text-charcoal/50">
                      Đăng ký để bắt đầu quản lý quán của bạn
                    </p>
                  </div>
                  <RegisterForm onSwitch={switchToLogin} onRegistered={switchToLogin} showDialog={showDialog} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <Dialog config={dialog} onClose={closeDialog} />
    </div>
  );
};
