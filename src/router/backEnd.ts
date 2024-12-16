import { RouteService } from "@/api/routesService";


const menuApi=new RouteService();
const layouModules: any = import.meta.glob('../layout/routerView/*.{vue,tsx}');
const viewsModules: any = import.meta.glob('../views/**/*.{vue,tsx}');