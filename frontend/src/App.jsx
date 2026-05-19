import TicketForm from "./components/TicketForm.jsx";

export default function App() {
  return (
    <main className="app-shell">
      <section className="app-header" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">MVP de validacion</p>
          <h1 id="page-title">Validacion de tickets de compra</h1>
          <p className="intro">
            Sube un ticket, revisa los datos detectados y envia la validacion.
          </p>
        </div>
      </section>

      <TicketForm />
    </main>
  );
}
