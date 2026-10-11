import { Route, Routes } from "react-router";
import { ROUTES } from "../units/routes";
import { HomePage } from "../pages/HomePage";
import { RoadmapPage } from "../pages/RoadmapPage";
import { PracticePage } from "../pages/PracticePage";
import { TestPage } from "../pages/TestPage";
import { RulePage } from "../pages/RulesPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { DocsLayout } from "../layouts/DocsLayout";

export const AppRouter = () => {
  return (
    <Routes>
      <Route index element={<HomePage />} />

      <Route>
        <Route path={ROUTES.ROADMAP} element={<RoadmapPage />} />
        <Route path={ROUTES.PRACTICE} element={<PracticePage />} />
        <Route path={ROUTES.TEST} element={<TestPage />} />
      </Route>

      <Route path={ROUTES.RULE} element={<RulePage />} />

      <Route>
        <Route path={ROUTES.THEORY} element={<DocsLayout section="theory"/>}/ >
        <Route path={ROUTES.COMPONENTS} element={<DocsLayout section="components" />}/ >
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
