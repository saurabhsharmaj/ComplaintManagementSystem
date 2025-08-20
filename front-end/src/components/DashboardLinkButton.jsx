import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Link } from "react-router-dom";

const DashboardLinkButton = ({
  name,
  icon,
  link,
  onClick,
  className,
  subtitle,
}) => {
  return (
    <Link
      className="block w-full"
      to={link}
      onClick={() => {
        onClick ? onClick() : null;
      }}
    >
      <div
        className={`DashboardLinkButton
          border shadow-[3px_4px_4px_rgba(0,0,0,0.26)]
          rounded-lg border-black
          flex flex-col justify-center items-center
          w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg
          px-4 sm:px-6 md:px-10 py-6 md:py-10
          mx-auto my-4
          bg-white bg-opacity-90
          hover:shadow-lg transition
          ${className}
        `}
      >
        <FontAwesomeIcon size={"2x"} icon={icon} />
        <p className="mt-4 text-center text-base sm:text-lg md:text-xl font-medium">{name}</p>
        <p
          className={`text-center text-xs sm:text-sm md:text-base lg:text-base ${
            !subtitle ? "hidden" : "block"
          }`}
        >
          ({subtitle})
        </p>
      </div>
    </Link>
  );
};

export default DashboardLinkButton;
