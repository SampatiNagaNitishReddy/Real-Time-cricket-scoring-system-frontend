import { Link } from "react-router-dom";

function DashboardPage() {
  const cards = [
    {
      title: "Create Match",
      icon: "➕",
      description: "Create a new cricket match",
      link: "/matches/create",
    },
    {
      title: "Match Controls",
      icon: "🎮",
      description: "Manage your  matches",
      link: "/dashboard/matches",
    },
    {
      title: "My Teams",
      icon: "🛡",
      description: "View and manage your teams",
      link: "/dashboard/teams",
    },
    {
      title: "Tournaments",
      icon: "🏆",
      description: "Coming Soon",
      disabled: true,
    },
    {
      title: "Statistics",
      icon: "📈",
      description: "Coming Soon",
      disabled: true,
    },
    {
      title: "Settings",
      icon: "⚙",
      description: "Coming Soon",
      disabled: true,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-bold mb-2">
          Dashboard
        </h1>

        <p className="text-zinc-400 mb-10">
          Manage your cricket activities
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {cards.map((card) =>

            card.disabled ? (

              <div
                key={card.title}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 opacity-60"
              >
                <div className="text-4xl mb-4">
                  {card.icon}
                </div>

                <h2 className="text-xl font-semibold mb-2">
                  {card.title}
                </h2>

                <p className="text-zinc-400">
                  {card.description}
                </p>
              </div>

            ) : (

              <Link
                key={card.title}
                to={card.link}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-blue-500 hover:scale-[1.02] transition"
              >
                <div className="text-4xl mb-4">
                  {card.icon}
                </div>

                <h2 className="text-xl font-semibold mb-2">
                  {card.title}
                </h2>

                <p className="text-zinc-400">
                  {card.description}
                </p>
              </Link>

            )

          )}

        </div>

      </div>

    </div>
  );
}

export default DashboardPage;