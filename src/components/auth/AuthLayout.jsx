const FEATURES = [
  "Ball-by-ball live scoring",
  "Scorecards, overs and commentary",
  "Player and team leaderboards",
];

function AuthLayout({ title, subtitle, children, footer, wide = false }) {
  return (
    <div className="grid min-h-[calc(100vh-81px)] bg-black text-white lg:grid-cols-2">

      {/* Brand panel (desktop only) */}
      <aside className="relative hidden overflow-hidden border-r border-zinc-800 lg:flex lg:flex-col lg:justify-center lg:px-16">

        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-green-500/15 via-transparent to-transparent" />

        <div className="relative">
          <h2 className="text-5xl font-extrabold leading-tight">
            Score every ball.
            <br />
            <span className="text-green-400">Live.</span>
          </h2>

          <p className="mt-4 max-w-md text-lg text-zinc-400">
            Create matches, score in real time and follow every over, wicket and run.
          </p>

          <ul className="mt-10 space-y-4">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-zinc-300">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/15 text-green-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-4 py-10 sm:px-8">

        <div className={`w-full ${wide ? "max-w-xl" : "max-w-md"}`}>

          <h1 className="text-3xl font-bold text-white sm:text-4xl">{title}</h1>

          {subtitle && <p className="mt-2 text-zinc-400">{subtitle}</p>}

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-6 text-center text-zinc-400">{footer}</div>}

        </div>

      </main>

    </div>
  );
}

export default AuthLayout;