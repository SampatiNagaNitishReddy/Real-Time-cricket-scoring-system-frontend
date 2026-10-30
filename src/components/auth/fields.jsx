import { useState } from "react";

const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-500 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20";

const labelClass = "mb-1.5 block text-sm font-medium text-zinc-300";

export function Field({ label, id, className = "", ...props }) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input id={id} className={inputClass} {...props} />
    </div>
  );
}

export function PasswordField({ label, id, className = "", ...props }) {
  const [show, setShow] = useState(false);

  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          className={`${inputClass} pr-16`}
          {...props}
        />

        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 px-4 text-sm font-medium text-zinc-400 transition hover:text-white"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

export function SelectField({ label, id, className = "", children, ...props }) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>

      <div className="relative">
        <select
          id={id}
          style={{ colorScheme: "dark" }}
          className={`${inputClass} appearance-none pr-10`}
          {...props}
        >
          {children}
        </select>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
        >
          <path
            fillRule="evenodd"
            d="M5.3 7.3a1 1 0 011.4 0L10 10.6l3.3-3.3a1 1 0 111.4 1.4l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}

export function Spinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}