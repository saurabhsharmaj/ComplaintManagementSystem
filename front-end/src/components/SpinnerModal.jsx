import { RotateLoader } from "react-spinners";
import spinnerBottomImage from '../assets/spinner-bottom.png'
import { useTranslation } from "react-i18next";
const SpinnerModal = ({ visible }) => {
  const { t } = useTranslation();
  return (
    <div
      className={`bg-black bg-opacity-90 h-screen w-full  fixed flex justify-center items-center z-20 flex-col ${visible ? "block" : "hidden"
        }`}
    >
      <RotateLoader color="#fef303" />
      <p className="text-white font-extrabold mt-20 text-xl">{t("Please Wait")}</p>
      <img
        className="absolute bottom-0 w-auto lg:h-40 h-20"
        src={spinnerBottomImage} alt="" srcset="" />
    </div>
  );
};

export default SpinnerModal;
