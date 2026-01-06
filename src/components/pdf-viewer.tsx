import { useEffect, useRef, useState } from 'react';

import { useMenuContext } from '../context';
import { SteamClient } from "@decky/ui/dist/globals/steam-client";
import { ControllerInputGamepadButton } from '@decky/ui/dist/globals/steam-client/Input';
import { PdfViewState } from '../interfaces';
import { Focusable } from '@decky/ui';

import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs";
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc as string;

const BUTTON_LEFT = [ControllerInputGamepadButton.GAMEPAD_BUTTON_DPAD_LEFT, ControllerInputGamepadButton.GAMEPAD_LEFTSTICK_LEFT];
const BUTTON_RIGHT = [ControllerInputGamepadButton.GAMEPAD_BUTTON_DPAD_RIGHT, ControllerInputGamepadButton.GAMEPAD_LEFTSTICK_RIGHT];
const BUTTON_UP = [ControllerInputGamepadButton.GAMEPAD_BUTTON_DPAD_UP, ControllerInputGamepadButton.GAMEPAD_LEFTSTICK_UP];
const BUTTON_DOWN = [ControllerInputGamepadButton.GAMEPAD_BUTTON_DPAD_DOWN, ControllerInputGamepadButton.GAMEPAD_LEFTSTICK_DOWN];

const DEFAULT_ZOOM = 1.5;
const MAX_ZOOM = 3;
const MIN_ZOOM = 1.5;
const ZOOM_STEP = 0.3;

const OFFSET_STEP = 20;

declare var SteamClient: SteamClient;

export const PdfViewer = () => {

    const { gameEvent } = useMenuContext();

    const [viewState, setViewState] = useState<PdfViewState>({
        pageNumber: 1,
        zoom: 1.5,
        totalPages: 1,
        position: { x: 0, y: 0 }
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pdfRef = useRef<pdfjsLib.PDFDocumentProxy>(null);
    const focusableRef = useRef<HTMLDivElement>(null);

    const loadPdfDocument = async () => {
        if (!canvasRef.current || !gameEvent) return;
        const pdf = await pdfjsLib
            .getDocument({
                url: gameEvent.manual_path.replace(/\\/g, ""),
                useSystemFonts: true,
                disableFontFace: true,
                verbosity: pdfjsLib.VerbosityLevel.INFOS
            }).promise;
        pdfRef.current = pdf;
        setViewState((prev) => ({
            ...prev,
            totalPages: pdf.numPages
        }));
    }

    const reloadPdfPage = async () => {
        if (!canvasRef.current || !pdfRef.current) return;
        const page = await pdfRef.current.getPage(viewState.pageNumber);
        const viewport = page.getViewport({
            scale:
                viewState.zoom,
            offsetX: viewState.position.x,
            offsetY: viewState.position.y
        });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d")!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport, canvas }).promise;
    };

    const goToNextPage = () => {
        if (viewState.pageNumber >= viewState.totalPages) return;
        setViewState((prev) => ({
            ...prev,
            pageNumber: prev.pageNumber + 1
        }));
    }

    const goToPreviousPage = () => {
        if (viewState.pageNumber <= 1) return;
        setViewState((prev) => ({
            ...prev,
            pageNumber: prev.pageNumber - 1
        }));
    }

    const zoomIn = () => {
        if (viewState.zoom >= MAX_ZOOM) return;
        setViewState((prev) => {
            const newZoom = prev.zoom + ZOOM_STEP;
            return {
                ...prev,
                position: newZoom <= DEFAULT_ZOOM ? { x: 0, y: 0 } : prev.position,
                zoom: newZoom
            }
        });
    }

    const zoomOut = () => {
        if (viewState.zoom <= MIN_ZOOM) return;
        setViewState((prev) => {
            const newZoom = prev.zoom - ZOOM_STEP;
            return {
                ...prev,
                position: newZoom <= DEFAULT_ZOOM ? { x: 0, y: 0 } : prev.position,
                zoom: newZoom
            }
        });
    }

    const moveX = (x: number) => {
        setViewState((prev) => ({
            ...prev,
            position: { x: prev.position.x + x, y: prev.position.y }
        }));
    }

    const moveY = (y: number) => {
        setViewState((prev) => ({
            ...prev,
            position: { x: prev.position.x, y: prev.position.y + y }
        }));
    }

    useEffect(() => {
        if (!gameEvent) return;

        const loadPdf = async () => {
            if (!pdfRef.current) {
                await loadPdfDocument();
            }
            await reloadPdfPage();
        };
        loadPdf();
    }, [gameEvent, viewState.pageNumber, viewState.zoom, viewState.position]);

    useEffect(() => {
        if (!gameEvent) return;

        focusableRef.current?.focus();

        const unregisterable = SteamClient.Input.RegisterForControllerInputMessages((_, button, isPressed) => {

            console.log(button, isPressed);

            const takeFocus = () => {
                focusableRef.current?.focus();
            }

            if (!isPressed) {
                return;
            }

            if (button === ControllerInputGamepadButton.GAMEPAD_BUTTON_LSHOULDER) {
                zoomOut();
                takeFocus();
                return;
            }

            if (button === ControllerInputGamepadButton.GAMEPAD_BUTTON_RSHOULDER) {
                zoomIn();
                takeFocus();
                return;
            }

            const isDirectionPressed = (buttons: ControllerInputGamepadButton[]) => {
                return buttons.includes(button);
            };

            const moveOffset = viewState.zoom * OFFSET_STEP;

            if (isDirectionPressed(BUTTON_LEFT)) {
                if (viewState.zoom <= DEFAULT_ZOOM) {
                    goToPreviousPage();
                } else {
                    moveX(moveOffset);
                }
                takeFocus();
                return;
            }

            if (isDirectionPressed(BUTTON_RIGHT)) {
                if (viewState.zoom <= DEFAULT_ZOOM) {
                    goToNextPage();
                } else {
                    moveX(-moveOffset);
                }
                takeFocus();
                return;
            }

            if (isDirectionPressed(BUTTON_UP)) {
                moveY(moveOffset);
                takeFocus();
                return;
            }

            if (isDirectionPressed(BUTTON_DOWN)) {
                moveY(-moveOffset);
                takeFocus();
                return;
            }
        });

        return () => {
            unregisterable.unregister();
        };
    }, [viewState, setViewState, gameEvent]);


    if (!gameEvent) {
        return <div />;
    }

    return (
        <div style={{
            marginTop: "20px",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
        }}>

            <Focusable
                noFocusRing
                ref={focusableRef}
                onActivate={() => { }}
            >
                <canvas
                    ref={canvasRef}
                />
            </Focusable>
        </div>
    );
};