import type { ReactNode } from "react";

interface Button {

    onClick?: () => void;
    label?: string;
    className: string;
    children?: ReactNode;


}


const Button = ({ onClick, label='', className, children='' }: Button) => {
  return (
    <button onClick={onClick} className={className + ` cursor-pointer`} >
        {label || children}
    </button>
  )
}

export default Button