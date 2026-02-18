import React from "react";

export default function SkeletonRow({ cols = 5 }) {
    return (
        <tr className="skeleton-row">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i}>
                    <div className="skeleton-box" style={{ width: i === 2 ? "80%" : "60%" }}></div>
                </td>
            ))}
        </tr>
    );
}
