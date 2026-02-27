import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import Navbar from "components/Navbar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return(
    <div>
      <Navbar />
      <h1 className="text-3xl text-indigo-700 font-extrabold">Welcome to Roomify!</h1>
    </div>
    );
}
