export default function Mesas() {
  // Ejemplo de mesas mockeadas
  const mesas = [
    { id: 1, numero: "Mesa 1", estado: "Libre" },
    { id: 2, numero: "Mesa 2", estado: "Ocupada" },
    { id: 3, numero: "Mesa 3", estado: "Reservada" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestión de Mesas</h1>
      <div className="grid grid-cols-3 gap-4">
        {mesas.map((mesa) => (
          <div
            key={mesa.id}
            className={`p-4 rounded shadow text-center ${
              mesa.estado === "Libre"
                ? "bg-green-200"
                : mesa.estado === "Ocupada"
                ? "bg-red-200"
                : "bg-yellow-200"
            }`}
          >
            <h2 className="font-bold">{mesa.numero}</h2>
            <p>{mesa.estado}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
