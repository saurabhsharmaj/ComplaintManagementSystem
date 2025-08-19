import React, { useState } from "react";
import { User, MoreVertical, Edit3, Trash2, Mail, Phone, Building2 } from "lucide-react";
import { motion } from "framer-motion";

const NodeCard = ({ node, onDragStart, onClick, canDrag, isAdmin, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      draggable={canDrag}
      onDragStart={canDrag ? (e) => onDragStart(e, node._id) : undefined}
      onClick={() => onClick(node)}
      layout
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 sm:p-3 shadow hover:shadow-md transition w-full cursor-pointer relative group"
    >
      {isAdmin && (
        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 rounded"
            aria-label="More actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(node);
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Edit3 className="w-4 h-4 mr-2" /> Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node);
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-3 py-2 text-xs text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex items-start gap-2 sm:gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white overflow-hidden flex-shrink-0">
          {node.image ? (
            <img src={node.image} alt={node.name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 truncate leading-tight">{node.name}</h3>
          <p className="hidden sm:block text-[11px] text-indigo-700 dark:text-indigo-300 truncate">{node.role}</p>
        </div>
      </div>

      {/* Details hidden on mobile */}
      <div className="hidden sm:mt-2 sm:space-y-1 sm:text-[11px] sm:block text-gray-600 dark:text-gray-300">
        {node.department && (
          <div className="flex items-center gap-2 truncate">
            <Building2 className="w-3.5 h-3.5 text-gray-400" />
            <span className="truncate">{node.department}</span>
          </div>
        )}
        {node.email && (
          <div className="flex items-center gap-2 truncate">
            <Mail className="w-3.5 h-3.5 text-gray-400" />
            <span className="truncate">{node.email}</span>
          </div>
        )}
        {node.phone && (
          <div className="flex items-center gap-2 truncate">
            <Phone className="w-3.5 h-3.5 text-gray-400" />
            <span className="truncate">{node.phone}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NodeCard; 