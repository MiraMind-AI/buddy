"use client"

import type { AvatarState } from "@/features/avatar/useAvatar"
import { cn } from "@/lib/utils/cn"

const stateStyles: Record<
	AvatarState,
	{
		face: string
		ring: string
		mouth: string
		signal: string
	}
> = {
	idle: {
		face: "bg-violet-400",
		ring: "border-violet-300/35 shadow-violet-500/10",
		mouth: "h-1 bg-zinc-950",
		signal: "bg-violet-300/50",
	},
	listening: {
		face: "bg-emerald-400",
		ring: "border-emerald-300/50 shadow-emerald-500/20",
		mouth: "h-1 bg-zinc-950",
		signal: "bg-emerald-300",
	},
	thinking: {
		face: "bg-amber-400",
		ring: "border-amber-300/50 shadow-amber-500/20",
		mouth: "h-3 bg-zinc-950 animate-pulse",
		signal: "bg-amber-300",
	},
	speaking: {
		face: "bg-sky-400",
		ring: "border-sky-300/50 shadow-sky-500/20",
		mouth: "h-4 bg-zinc-950 animate-pulse",
		signal: "bg-sky-300",
	},
	error: {
		face: "bg-rose-400",
		ring: "border-rose-300/50 shadow-rose-500/20",
		mouth: "h-1 bg-zinc-950",
		signal: "bg-rose-300",
	},
}

export function AvatarCanvas({ state }: { state: AvatarState }) {
	const styles = stateStyles[state]

	return (
		<div className="relative grid h-full min-h-[260px] place-items-center overflow-hidden bg-[#121212]">
			<div className="absolute inset-x-8 top-12 h-px bg-white/10" />
			<div className="absolute inset-x-14 bottom-10 h-px bg-white/10" />

			<div
				className={cn(
					"relative grid size-44 place-items-center rounded-full border shadow-2xl transition",
					styles.ring,
				)}
			>
				<div className="absolute -top-6 flex gap-2">
					<span className={cn("size-2 rounded-full", styles.signal)} />
					<span className="size-2 rounded-full bg-white/20" />
					<span className="size-2 rounded-full bg-white/20" />
				</div>

				<div
					className={cn(
						"relative size-32 rounded-full transition",
						state === "idle" ? "" : "animate-pulse",
						styles.face,
					)}
				>
					<span className="absolute left-8 top-10 size-3 rounded-full bg-zinc-950" />
					<span className="absolute right-8 top-10 size-3 rounded-full bg-zinc-950" />
					<span
						className={cn(
							"absolute bottom-9 left-1/2 w-12 -translate-x-1/2 rounded-full transition-all",
							styles.mouth,
						)}
					/>
				</div>

				<div className="absolute -bottom-8 h-12 w-28 rounded-t-full bg-zinc-800" />
			</div>
		</div>
	)
}
