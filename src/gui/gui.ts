import { h } from "../lib/hyper"

export interface CubeCornerSelectorProp {
    select: (corner: number) => void
    colorNameArray: string[]
    colorNumberArray: number[]
}

export let cubeCornerSelector = (prop: CubeCornerSelectorProp) => {
    let button = (n: number) => {
        let color = prop.colorNameArray[n]
        let button = h("button", {
            textContent: `${color}`,
            onclick: () => { prop.select(prop.colorNumberArray[n]) }
        })
        button.style.backgroundColor = color
        if (n >= 4 || n == 2) {
            button.style.color = "white"
        }
        return button
    }
    let buttonArray = Array.from({ length: 8 }, (_, k) => button(k))
    let title = h("h3", { textContent: "Cutting axis" })
    title.style.padding = "8px"
    return h("div", {}, [title, ...buttonArray])
}
