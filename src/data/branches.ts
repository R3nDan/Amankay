export type Branch = {
  id: string;
  name: string;
  address: string;
  weekdays: string;
  saturday: string;
  sundaysAndHolidays: string;
  phone: string;
  demo: boolean;
};

export const branches: Branch[] = [
  {
    id: "sede-principal",
    name: "Sede principal",
    address: "Calle 4 # 5-55, Centro de Neiva",
    weekdays: "6:30 a. m. – 6:30 p. m.",
    saturday: "6:30 a. m. – 1:00 p. m.",
    sundaysAndHolidays: "Cerrado",
    phone: "312 586 4045",
    demo: false,
  },
  {
    id: "sede-demo",
    name: "Segunda sede",
    address: "Carrera 7 # 19-20, Neiva (dirección de prueba)",
    weekdays: "6:30 a. m. – 6:30 p. m.",
    saturday: "6:30 a. m. – 1:00 p. m.",
    sundaysAndHolidays: "Cerrado",
    phone: "312 586 4045",
    demo: true,
  },
];
