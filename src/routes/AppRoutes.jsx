import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import HomePage from "../pages/home/HomePage";
import MatchDetailsPage from "../pages/MatchDetails/MatchDetailsPage";
import MatchControlPage from "../pages/match/MatchControlPage";
import CreateMatchPage from "../pages/match/CreateMatchPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import MyTeamsPage from "../pages/teams/MyTeamsPage";
import CreateTeamPage from "../pages/teams/CreateTeamPage";
import TeamSquadPage from "../pages/teams/TeamSquadPage";
import ManageTeamPage from "../pages/teams/ManageTeamPage";
import EditTeamPage from "../pages/teams/EditTeamPage";
import RegisterPage from "../pages/auth/RegisterPage";
import MyLiveMatchesPage from "../pages/dashboard/MyLiveMatchesPage";
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/match/:matchId"
        element={<MatchDetailsPage />}
      />
      <Route
        path="/matches/:matchId/control"
        element={<MatchControlPage />}
      />
      <Route
        path="/matches/create"
        element={<CreateMatchPage />}
      />
      <Route
        path="/dashboard"
        element={<DashboardPage />}
      />
      <Route
        path="/dashboard/teams"
        element={<MyTeamsPage />}
      />
      <Route
        path="/dashboard/teams/create"
        element={<CreateTeamPage />}
      />
      <Route
        path="/dashboard/teams/:teamId"
        element={<TeamSquadPage />}
      />
      <Route
        path="/dashboard/teams/:teamId/manage"
        element={<ManageTeamPage />}
      />
      <Route
        path="/dashboard/teams/:teamId/edit"
        element={<EditTeamPage />}
      />
      <Route
        path="/register"
        element={<RegisterPage />}
      />
      <Route
        path="/dashboard/matches"
        element={<MyLiveMatchesPage />}
      />
    </Routes>


  );
}

export default AppRoutes;