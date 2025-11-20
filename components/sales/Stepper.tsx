"use client"

import { useEffect } from "react"
import { CheckCircle2 } from "lucide-react"

interface Step {
    id: number
    title: string
    icon: React.ComponentType<{ className?: string }>
    description: string
}

interface StepperProps {
    steps: Step[]
    currentStep: number
    onStepClick?: (stepId: number) => void
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
    // Auto-scroll to active step when it's not fully visible
    const scrollToActiveStep = () => {
        const stepperContainer = document.getElementById("stepper-scroll")
        if (!stepperContainer) return

        const stepElements = stepperContainer.querySelectorAll('[data-step-id]')
        const activeStepElement = Array.from(stepElements).find(
            (el) => parseInt(el.getAttribute('data-step-id') || '0') === currentStep
        )

        if (activeStepElement) {
            const containerRect = stepperContainer.getBoundingClientRect()
            const stepRect = activeStepElement.getBoundingClientRect()

            const isFullyVisible = stepRect.left >= containerRect.left &&
                stepRect.right <= containerRect.right

            if (!isFullyVisible) {
                const stepCenter = stepRect.left + stepRect.width / 2
                const containerCenter = containerRect.left + containerRect.width / 2
                const scrollOffset = stepCenter - containerCenter

                stepperContainer.scrollTo({
                    left: stepperContainer.scrollLeft + scrollOffset,
                    behavior: 'smooth'
                })
            }
        }
    }

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            scrollToActiveStep()
        }, 100)

        return () => clearTimeout(timeoutId)
    }, [currentStep])

    return (
        <div
            id="stepper-scroll"
            className="mb-6 flex items-center justify-start overflow-x-auto scroll-smooth scrollbar-hide lg:scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 cursor-grab active:cursor-grabbing select-none px-4 touch-pan-x"
            style={{
                WebkitOverflowScrolling: "touch",
            }}
            onMouseDown={(e) => {
                const el = e.currentTarget
                let startX = e.pageX - el.offsetLeft
                let scrollLeft = el.scrollLeft
                const handleMouseMove = (moveEvent: MouseEvent) => {
                    const x = moveEvent.pageX - el.offsetLeft
                    const walk = (x - startX) * 1.2
                    el.scrollLeft = scrollLeft - walk
                }
                const stopDrag = () => {
                    document.removeEventListener("mousemove", handleMouseMove)
                    document.removeEventListener("mouseup", stopDrag)
                    el.classList.remove("grabbing")
                }
                document.addEventListener("mousemove", handleMouseMove)
                document.addEventListener("mouseup", stopDrag)
                el.classList.add("grabbing")
            }}
            onScroll={(e) => {
                const el = e.currentTarget
                const fadeLeft = document.getElementById("fade-left")
                const fadeRight = document.getElementById("fade-right")
                const isAtStart = el.scrollLeft <= 10
                const isAtEnd = el.scrollWidth - el.clientWidth - el.scrollLeft <= 10
                if (fadeLeft) fadeLeft.style.opacity = isAtStart ? "0" : "1"
                if (fadeRight) fadeRight.style.opacity = isAtEnd ? "0" : "1"
            }}
        >
            <div className="flex items-center justify-center mx-auto min-w-max">
                <div className="flex items-center justify-center mx-auto min-w-max">
                    {steps.map((step, index) => {
                        const Icon = step.icon
                        const isActive = currentStep === step.id
                        const isCompleted = currentStep > step.id

                        return (
                            <div key={step.id} className="flex items-center" data-step-id={step.id}>
                                <div className="flex flex-col items-center gap-3">
                                    <div
                                        className={`
                  relative w-14 h-14 rounded-full flex items-center justify-center
                  transition-all duration-300 ease-in-out
                  ${isActive
                                                ? "bg-primary border-2 border-primary shadow-lg scale-110"
                                                : isCompleted
                                                    ? "bg-primary border-2 border-primary"
                                                    : "bg-white border-2 border-gray-300 hover:border-gray-400 hover:scale-105"
                                            }
                  ${!isActive && !isCompleted ? "cursor-pointer" : ""}
                `}
                                        onClick={() => onStepClick?.(step.id)}
                                    >
                                        <Icon
                                            className={`
                    w-6 h-6 transition-colors duration-300
                    ${isActive || isCompleted ? "text-white" : "text-gray-400"}
                  `}
                                        />
                                        {isCompleted && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-center max-w-[100px]">
                                        <p
                                            className={`
                    text-xs leading-tight transition-all duration-300
                    ${isActive ? "text-primary font-bold" : "text-gray-500 font-normal"}
                  `}
                                        >
                                            {step.title}
                                        </p>
                                    </div>
                                </div>

                                {index < steps.length - 1 && (
                                    <div className="relative mx-3 mb-8" style={{ width: "60px" }}>
                                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-300" />
                                        <div
                                            className={`
                    absolute top-0 left-0 h-0.5 bg-primary transition-all duration-500 ease-in-out
                    ${isCompleted ? "right-0" : "right-full"}
                  `}
                                        />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
