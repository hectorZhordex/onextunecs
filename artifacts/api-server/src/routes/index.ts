import { Router, type IRouter } from "express";
import healthRouter from "./health";
import musicRouter from "./music";
import playlistsRouter from "./playlists";
import libraryRouter from "./library";
import historyRouter from "./history";

const router: IRouter = Router();

router.use(healthRouter);
router.use(musicRouter);
router.use(playlistsRouter);
router.use(libraryRouter);
router.use(historyRouter);

export default router;
