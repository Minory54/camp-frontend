import { Button } from "../../components/Button";
import { Header } from "../../components/Header";
import { Typography } from "../../components/Typography";
import { ROUTES } from "../../units/routes";
import "./style.scss";

export const HomePage = () => {
  return (
    <>
      <main className="layout-wrapper home">
        <section className="container">
          <Header transparency />
          <div className="home__content">
            <Typography variable="display">Школа цифрового творчества</Typography>
            <Button link color="yellow" display to={ROUTES.ROADMAP}>
              Начать обучение
            </Button>
          </div>
        </section>
        <section className="home__images"></section>
      </main>
    </>
  );
};
