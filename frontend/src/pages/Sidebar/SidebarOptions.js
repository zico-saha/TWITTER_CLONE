// Importing styles for the SidebarOptions component
import "./SidebarOptions.css";

// SidebarOptions component definition
function SidebarOptions({ active, text, Icon }) {
    return (
        <div className={`sidebarOptions ${active && "sidebarOptions--active"}`}>
            {/* Render the icon component */}
            <Icon />
            {/* Render the text for the option */}
            <h2>{text}</h2>
        </div>
    );
}

// Exporting the SidebarOptions component
export default SidebarOptions;