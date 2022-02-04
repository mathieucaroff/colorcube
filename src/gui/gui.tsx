import { Radio, Space } from "antd"
import React from "react"
import ReactDOM from "react-dom"
import { h } from "../lib/hyper"
import "antd/dist/antd.css"

export interface CubeCornerSelectorProp {
    setCorner: (corner: number) => void
    colorNameArray: string[]
    currentCorner: number
}

export let CubeCornerSelector = (prop: CubeCornerSelectorProp) => {
    let div = h("div")

    ReactDOM.render(
        <div>
            <h3 style={{ padding: "8px", color: "white" }}>Cutting axis</h3>
            <Radio.Group
                onChange={(ev) => {
                    prop.setCorner(ev.target.value)
                }}
            >
                <Space direction="vertical">
                    {prop.colorNameArray.map((_, k) => {
                        let color = prop.colorNameArray[k]
                        let disabled = k == prop.currentCorner
                        return (
                            <Radio.Button
                                key={k}
                                style={{
                                    backgroundColor: disabled ? "grey" : color,
                                    color: (k >= 4 || k == 2) && !disabled ? "white" : "black",
                                }}
                                value={k}
                                disabled={disabled}
                            >
                                {color}
                            </Radio.Button>
                        )
                    })}
                </Space>
            </Radio.Group>
        </div>,
        div,
    )

    return div
}
