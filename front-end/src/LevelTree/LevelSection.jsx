import React from "react";
import NodeCard from "./NodeCard";

const LevelSection = ({
  level,
  levelName,
  isEditing,
  onLevelNameDoubleClick,
  onLevelNameChange,
  onLevelNameBlur,
  onDrop,
  onDragOver,
  onDragStart,
  onNodeClick,
  nodes,
  canEditLevelName,
  canDrag,
  currentUserRole,
  onEditNode,
  onDeleteNode,
  isDragging,
  onAddMember,
}) => {
  if (!nodes.length && !isDragging) return null;
  const isAdmin = currentUserRole === "admin";

  return (
    <div
      id={`level-${level}`}
      onDragOver={canDrag ? onDragOver : undefined}
      onDrop={canDrag ? (e) => onDrop(e, level) : undefined}
      className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-4 m-3 bg-white dark:bg-gray-900 shadow-inner min-h-[100px]"
    >
      <div className="flex items-center justify-between mb-3">
        {isEditing && canEditLevelName ? (
          <input
            type="text"
            value={levelName}
            onChange={(e) => onLevelNameChange(level, e.target.value)}
            onBlur={() => onLevelNameBlur(level)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onLevelNameBlur(level);
            }}
            autoFocus
            className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-300 dark:border-gray-600 focus:outline-none bg-transparent"
          />
        ) : (
          <div className="flex items-center gap-2">
            <h2
              className={`text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 ${
                canEditLevelName ? "cursor-pointer" : ""
              }`}
              onDoubleClick={canEditLevelName ? () => onLevelNameDoubleClick(level) : undefined}
            >
              {levelName}
            </h2>
            <span className="text-[10px] sm:text-[11px] bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5">
              {nodes.length}
            </span>
            <span className="hidden sm:inline text-[11px] text-gray-500 dark:text-gray-400">Level {level}</span>
          </div>
        )}

        {/* {isAdmin && (
          <button
            onClick={() => onAddMember(level)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-full text-[11px] shadow"
          >
            + Add Member
          </button>
        )} */}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
        {nodes.map((node) => (
          <NodeCard
            key={node._id}
            node={node}
            onDragStart={onDragStart}
            onClick={onNodeClick}
            canDrag={canDrag}
            isAdmin={isAdmin}
            onEdit={onEditNode}
            onDelete={onDeleteNode}
          />
        ))}
      </div>
    </div>
  );
};

export default LevelSection; 