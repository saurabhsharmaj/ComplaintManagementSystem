// LevelTree.jsx
// NOTE: Single-file version with NO features removed — only enhancements added to match backend fields.
// Backend fields: name, role, email, phone, department, image, level
// Enhancements:
//  - Add Node form now includes email, phone, department
//  - Edit Node modal includes email, phone, department
//  - Node detail modal shows email, phone, department
//  - Node cards (NodeBox) show department badge
//  - Small client-side validation (non-blocking UI msg)
//  - Optional search/filter (non-breaking; if unused, everything works the same)
//  - Kept drag & drop, level renaming (local), CRUD, and all existing styles intact

import React, { useState, useEffect, useMemo } from "react";
import { User, MoreVertical, Edit3, Trash2, Mail, Phone, Building2, Search } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import LevelSection from "./LevelSection";
import ThemeToggle from "./ThemeToggle";
import { API_BASE_URL } from "@/config";
import Navbar from "../components/Navbar";
import { useTranslation } from "react-i18next";

/* ---------------------------------------------
 * Utility helpers (non-breaking, for UX/validation)
 * --------------------------------------------*/
const isValidEmail = (email) => {
  if (!email) return true; // optional field – only validate if present
  // simple RFC5322-ish check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};
const isValidPhone = (phone) => {
  if (!phone) return true; // optional
  // digits, +, -, spaces, parentheses allowed
  return /^[0-9+()\-\s]{6,20}$/.test(phone.trim());
};

/* ---------------------------------------------
 * NodeBox — unchanged structure, only shows department badge if present
 * --------------------------------------------*/
const NodeBox = ({ node, onDragStart, onClick, canDrag, isAdmin, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      draggable={canDrag}
      onDragStart={canDrag ? (e) => onDragStart(e, node._id) : undefined}
      onClick={() => onClick(node)}
      layout
      whileHover={{ scale: 1.05 }}
      className="min-w-[120px] max-w-[180px] bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl text-black flex flex-col items-center justify-center p-3 m-2 shadow-xl cursor-pointer relative group"
    >
      {isAdmin && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 text-gray-600 hover:text-gray-900 rounded"
            aria-label="More actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-6 bg-white rounded-lg shadow-lg border border-gray-300 z-20 overflow-hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(node);
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Edit3 className="w-4 h-4 mr-2" /> Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node);
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </button>
            </div>
          )}
        </div>
      )}

      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-2 flex-shrink-0 overflow-hidden">
        {node.image ? (
          <img
            src={node.image}
            alt={node.name}
            className="w-full h-full rounded-full border-2 border-white object-cover"
          />
        ) : (
          <User className="w-6 h-6 text-white" />
        )}
      </div>

      <div className="text-center">
        <h3 className="text-sm font-semibold truncate max-w-[140px]">{node.name}</h3>
        <p className="text-xs italic text-gray-600 truncate max-w-[140px]">{node.role}</p>
      </div>

      {node.department && (
        <div className="mt-2 text-[10px] px-2 py-0.5 bg-white/70 text-gray-700 rounded-full flex items-center gap-1">
          <Building2 className="w-3 h-3" />
          <span className="truncate max-w-[120px]">{node.department}</span>
        </div>
      )}
    </motion.div>
  );
};

/* ---------------------------------------------
 * LevelBox — unchanged behavior, reuses NodeBox
 * --------------------------------------------*/
const LevelBox = ({
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
}) => {
  if (!nodes.length && !isDragging) return null;
  const isAdmin = currentUserRole === "admin";

  return (
    <div
      id={`level-${level}`}
      onDragOver={canDrag ? onDragOver : undefined}
      onDrop={canDrag ? (e) => onDrop(e, level) : undefined}
      className="w-full border border-gray-300 rounded-xl p-6 m-4 bg-gray-50 dark:bg-gray-900 shadow-inner min-h-[160px]"
    >
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
          className="text-xl font-semibold text-center text-gray-700 dark:text-gray-200 mb-4 border-b border-gray-400 focus:outline-none bg-transparent"
        />
      ) : (
        <div className="flex items-center justify-center gap-2 mb-4">
          <h2
            className={`text-xl font-semibold text-center text-gray-700 dark:text-gray-200 ${
              canEditLevelName ? "cursor-pointer" : ""
            }`}
            onDoubleClick={canEditLevelName ? () => onLevelNameDoubleClick(level) : undefined}
          >
            {levelName}
          </h2>
          <span className="text-xs bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5">
            {nodes.length}
          </span>
        </div>
      )}

      <div className="flex flex-wrap justify-center">
        {nodes.map((node) => (
          <NodeBox
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

/* ---------------------------------------------
 * LevelTree — main container
 * --------------------------------------------*/
const LevelTree = () => {
  const { t } = useTranslation();
  const [currentUserRole, setCurrentUserRole] = useState("citizen"); // "admin" | "citizen"
  const [user, setUser] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [levels, setLevels] = useState([]);
  const [levelNames, setLevelNames] = useState({});
  const [levelsDocs, setLevelsDocs] = useState([]);
  const [editingLevel, setEditingLevel] = useState(null);

  // Form (Add)
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    department: "",
    image: "",
    level: 1,
  });
  const [newLevelName, setNewLevelName] = useState("");

  // Edit / Delete modal
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingNode, setIsEditingNode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // UX: simple validation feedback on Add form
  const [formHint, setFormHint] = useState("");
  const [editFormErrors, setEditFormErrors] = useState({});

  // UX: optional search (non-breaking)
  const [search, setSearch] = useState("");

  const syncLevelsFromDocs = (docs) => {
    const sorted = [...docs].sort((a, b) => a.number - b.number);
    setLevelsDocs(sorted);
    setLevels(sorted.map((d) => d.number));
    setLevelNames(sorted.reduce((acc, d) => ({ ...acc, [d.number]: d.name }), {}));
    // Ensure the form level defaults to first available level if none
    if (sorted.length && !sorted.some((d) => d.number === formData.level)) {
      setFormData((prev) => ({ ...prev, level: sorted[0].number }));
    }
  };

  const seedDefaultLevelsIfNeeded = async (existing) => {
    if (existing && existing.length) return existing;
    const defaults = [
      { name: "Executive Board" },
      { name: "Management" },
      { name: "Staff" },
    ];
    const created = [];
    for (const def of defaults) {
      const res = await axios.post("http://localhost:5000/api/levels", { name: def.name });
      created.push(res.data);
    }
    return created;
  };

  // Fetch user data and determine role
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (userId && token) {
      fetch(API_BASE_URL + "/user/" + userId, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((userData) => {
          setUser(userData);
          setCurrentUserRole(userData.type === "admin" ? "admin" : "citizen");
        })
        .catch(() => {
          setUser(null);
          setCurrentUserRole("citizen");
        });
    } else {
      setUser(null);
      setCurrentUserRole("citizen");
    }
  }, []);

  // Fetch levels and nodes from backend
  useEffect(() => {
    const init = async () => {
      try {
        const [levelsRes, nodesRes] = await Promise.all([
          axios.get("http://localhost:5000/api/levels"),
          axios.get("http://localhost:5000/api/nodes"),
        ]);

        let levelDocs = levelsRes.data;
        if (!levelDocs || levelDocs.length === 0) {
          levelDocs = await seedDefaultLevelsIfNeeded(levelDocs);
        }

        // If nodes contain numeric levels without docs, create placeholders
        const numbersFromNodes = Array.from(new Set((nodesRes.data || []).map((n) => n.level))).filter(
          (v) => v != null
        );
        const missing = numbersFromNodes.filter(
          (num) => !levelDocs.some((ld) => ld.number === num)
        );
        if (missing.length) {
          for (const num of missing) {
            const res = await axios.post("http://localhost:5000/api/levels", { name: `Level ${num}`, number: num });
            levelDocs.push(res.data);
          }
        }

        syncLevelsFromDocs(levelDocs);
        setNodes(nodesRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----------------------
   * Level name editing
   * ----------------------*/
  const handleLevelNameDoubleClick = (level) => setEditingLevel(level);
  const handleLevelNameChange = (level, value) => setLevelNames((prev) => ({ ...prev, [level]: value }));
  const handleLevelNameBlur = async (level) => {
    setEditingLevel(null);
    try {
      const newName = (levelNames[level] || "").trim() || `Level ${level}`;
      const doc = levelsDocs.find((d) => d.number === level);
      if (!doc) {
        const res = await axios.post("http://localhost:5000/api/levels", { name: newName, number: level });
        const updated = [...levelsDocs, res.data];
        syncLevelsFromDocs(updated);
      } else if (doc.name !== newName) {
        const res = await axios.put(`http://localhost:5000/api/levels/${doc._id}`, { name: newName });
        const updated = levelsDocs.map((d) => (d._id === doc._id ? res.data : d));
        syncLevelsFromDocs(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ----------------------
   * Add Form — change
   * ----------------------*/
  const handleChange = (e) => {
    const { name, value } = e.target;
    // level is number
    setFormData((prev) => ({ ...prev, [name]: name === "level" ? parseInt(value) : value }));
    if (name === "email" || name === "phone") {
      setFormHint(""); // clear hint on typing
    }
  };

  /* ----------------------
   * Add Form — submit
   * ----------------------*/
  const handleSubmit = async (e) => {
    e.preventDefault();
    // soft validation (non-blocking): just show hint if invalid
    if (!isValidEmail(formData.email)) {
      setFormHint("Invalid email format.");
      return;
    }
    if (!isValidPhone(formData.phone)) {
      setFormHint("Invalid phone format.");
      return;
    }

    try {
      let finalLevel = formData.level;
      let finalLevelId = null;
      let levelDocs = [...levelsDocs];

      if (formData.level === 0 && newLevelName.trim()) {
        const createRes = await axios.post("http://localhost:5000/api/levels", { name: newLevelName.trim() });
        const created = createRes.data;
        finalLevel = created.number;
        finalLevelId = created._id;
        levelDocs.push(created);
        syncLevelsFromDocs(levelDocs);
      } else {
        const doc = levelDocs.find((d) => d.number === formData.level);
        if (doc) finalLevelId = doc._id;
      }

      const res = await axios.post("http://localhost:5000/api/nodes", {
        ...formData,
        level: finalLevel,
        levelId: finalLevelId,
      });

      setNodes((prev) => [...prev, res.data]);
      setFormData({
        name: "",
        role: "",
        email: "",
        phone: "",
        department: "",
        image: "",
        level: levels[0] || 1,
      });
      setNewLevelName("");
      setShowForm(false);
      setFormHint("");
    } catch (err) {
      console.error(err);
      setFormHint("Server error while adding node.");
    }
  };

  /* ----------------------
   * Drag & Drop between levels
   * ----------------------*/
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("nodeId", id);
    setIsDragging(true);
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = async (e, newLevel) => {
    e.preventDefault();
    const nodeId = e.dataTransfer.getData("nodeId");
    try {
      const node = nodes.find((n) => n._id === nodeId);
      if (!node) return;
      const doc = levelsDocs.find((d) => d.number === newLevel);
      const payload = { level: newLevel };
      if (doc) payload.levelId = doc._id;
      const res = await axios.put(`http://localhost:5000/api/nodes/${nodeId}`, payload);
      setNodes((prev) => prev.map((n) => (n._id === nodeId ? res.data : n)));
    } catch (err) {
      console.error(err);
    }
    setIsDragging(false);
  };

  /* ----------------------
   * Editing an existing node
   * ----------------------*/
  const handleEditNode = async (e) => {
    e.preventDefault();
    if (!selectedNode) return;

    // soft validation for email/phone while editing
    if (!isValidEmail(selectedNode.email)) {
      // optional: you can show a small alert — we will keep consistent with add-form behavior:
      return;
    }
    if (!isValidPhone(selectedNode.phone)) {
      return;
    }

    try {
      const doc = levelsDocs.find((d) => d.number === selectedNode.level);
      const res = await axios.put(`http://localhost:5000/api/nodes/${selectedNode._id}`, {
        name: selectedNode.name,
        role: selectedNode.role,
        email: selectedNode.email,
        phone: selectedNode.phone,
        department: selectedNode.department,
        image: selectedNode.image,
        level: selectedNode.level,
        levelId: doc ? doc._id : undefined,
      });
      setNodes((prev) => prev.map((n) => (n._id === res.data._id ? res.data : n)));
      setIsEditingNode(false);
      setSelectedNode(null);
    } catch (err) {
      console.error(err);
    }
  };

  /* ----------------------
   * Delete node
   * ----------------------*/
  const confirmDeleteNode = (node) => setDeleteConfirm(node);

  const handleDeleteNode = async () => {
    if (!deleteConfirm) return;
    try {
      await axios.delete(`http://localhost:5000/api/nodes/${deleteConfirm._id}`);
      setNodes((prev) => prev.filter((n) => n._id !== deleteConfirm._id));
      setDeleteConfirm(null);
      setSelectedNode(null);
    } catch (err) {
      console.error(err);
    }
  };

  /* ----------------------
   * Optional: client-side search
   * ----------------------*/
  const filteredNodes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return nodes;
    return nodes.filter((n) => {
      const fields = [
        n.name || "",
        n.role || "",
        n.email || "",
        n.phone || "",
        n.department || "",
        String(n.level || ""),
      ].map((x) => x.toLowerCase());
      return fields.some((f) => f.includes(q));
    });
  }, [nodes, search]);

  const totalMembers = filteredNodes.length;

  return (
    <>
    <div className="mb-16">

    <Navbar />
    </div>
    <div className="min-h-screen relative overflow-x-hidden text-[13px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      {/* Add Node button */}
      
      {currentUserRole === "admin" && (
        <>
         
        <div className="sticky top-0 right-0 z-20 flex items-center gap-2 p-3 sm:p-4 backdrop-blur bg-white/70 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800">
        <div className="text-center ">
          {/* <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-200 mt-3">{t("Shiv Vihar Vikas Samiti")}</h1> */}
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t("Members")}: <span className="font-semibold">{totalMembers}</span></p>
        </div>
          <div className="flex sm:hidden items-center bg-white/90 dark:bg-gray-800/90 border border-gray-300 dark:border-gray-700 rounded-full px-3 py-1 shadow w-full">
            <Search className="w-4 h-4 mr-1 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("Search…")}
              className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 w-full"
            />
          </div>

          <div className="hidden sm:flex items-center bg-white/80 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full px-3 py-1 shadow ml-auto">
            <Search className="w-4 h-4 mr-1 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("Search…")}
              className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400"
            />
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="ml-auto sm:ml-0 bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2 rounded-full shadow-lg"
          >
            ➕ {t("Add Member")}
          </button>

          {/* Theme toggle */}
          {/* <ThemeToggle className='bg-green-300 p-20'/> */}
        </div>
        </>

      )}

    

      {/* Add Node Form — UPDATED to include email, phone, department */}
      {showForm && currentUserRole === "admin" && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-md z-50">
                      <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-6 w-full max-w-md">
              <button
                className="absolute top-3 right-4 text-gray-500 dark:text-gray-300 hover:text-red-500 text-xl font-bold"
                onClick={() => {
                  setShowForm(false);
                  setFormHint("");
                }}
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-gray-100">
                {t("Add New Member")}
              </h2>
              <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-4">{t("Fill the details below to add a new member to the organization.")}</p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="name" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{t("Name")} *</label>
                    <input
                      id="name"
                      name="name"
                      placeholder={t("e.g. Jane Doe")}
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{t("Role")} *</label>
                    <input
                      id="role"
                      name="role"
                      placeholder={t("e.g. Product Manager")}
                      required
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{t("Email")}</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder={t("name@example.com")}
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full rounded-lg border bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm ${
                        formData.email && !isValidEmail(formData.email) ? "border-red-400" : "border-gray-300 dark:border-gray-700"
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{t("Phone")}</label>
                    <input
                      id="phone"
                      name="phone"
                      placeholder={t("e.g. +1 555 0100")}
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full rounded-lg border bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm ${
                        formData.phone && !isValidPhone(formData.phone) ? "border-red-400" : "border-gray-300 dark:border-gray-700"
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="department" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{t("Department")}</label>
                    <input
                      id="department"
                      name="department"
                      placeholder={t("e.g. Engineering")}
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="image" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{t("Image URL")}</label>
                    <input
                      id="image"
                      name="image"
                      placeholder={t("https://...")}
                      value={formData.image}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="level" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{t("Level")}</label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  >
                    {levels.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {levelNames[lvl]} (Level {lvl})
                      </option>
                    ))}
                    <option value={0}>➕ {t("Add New Level")}</option>
                  </select>
                </div>

                {formData.level === 0 && (
                  <div>
                    <label htmlFor="newLevelName" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{t("New Level Name")}</label>
                    <input
                      id="newLevelName"
                      placeholder={t("e.g. Senior Leadership")}
                      value={newLevelName}
                      onChange={(e) => setNewLevelName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>
                )}

                {formHint && (
                  <p className="text-xs text-red-500 -mt-1">{formHint}</p>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow"
                  >
                    {t("Cancel")}
                  </button>
                  <button type="submit" className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-4 py-2.5 rounded-lg shadow">
                    ✅ {t("Add Member")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* Organization Chart (with optional filtered nodes) */}
      {levels.map((level) => (
        <LevelSection
          key={level}
          level={level}
          levelName={levelNames[level]}
          isEditing={editingLevel === level}
          onLevelNameDoubleClick={handleLevelNameDoubleClick}
          onLevelNameChange={handleLevelNameChange}
          onLevelNameBlur={handleLevelNameBlur}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragStart={handleDragStart}
          onNodeClick={(node) => setSelectedNode(node)}
          isDragging={isDragging}
          nodes={filteredNodes.filter((n) => n.level === level)}
          canEditLevelName={currentUserRole === "admin"}
          canDrag={currentUserRole === "admin"}
          currentUserRole={currentUserRole}
          onEditNode={(node) => {
            setSelectedNode(node);
            setIsEditingNode(true);
          }}
          onDeleteNode={confirmDeleteNode}
          onAddMember={(lvl) => {
            setFormData((prev) => ({ ...prev, level: lvl }));
            setShowForm(true);
          }}
        />
      ))}

      {/* Node Detail / Edit / Delete Modal */}
      {(selectedNode || deleteConfirm) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          {/* Detail / Edit */}
          {selectedNode && !deleteConfirm && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="relative w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 max-h-[90vh] overflow-y-auto"
            >
              <button
                className="absolute top-3 right-4 text-gray-500 hover:text-red-500 dark:text-gray-300 text-xl font-bold"
                onClick={() => {
                  setSelectedNode(null);
                  setIsEditingNode(false);
                }}
                aria-label="Close"
              >
                ×
              </button>

              {!isEditingNode ? (
                <div>
                  <div className="h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                  <div className="-mt-8 px-6 pb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full ring-4 ring-white dark:ring-gray-900 overflow-hidden shadow-md">
                        {selectedNode.image ? (
                          <img src={selectedNode.image} alt={selectedNode.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                            <User className="w-7 h-7 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">{selectedNode.name}</h2>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300 truncate">{selectedNode.role}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                            {levelNames[selectedNode.level]} • L{selectedNode.level}
                          </span>
                          {selectedNode.department && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                              {selectedNode.department}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2 text-sm">
                      {selectedNode.email && (
                        <a href={`mailto:${selectedNode.email}`} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:underline">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="break-all">{selectedNode.email}</span>
                        </a>
                      )}
                      {selectedNode.phone && (
                        <a href={`tel:${selectedNode.phone}`} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:underline">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{selectedNode.phone}</span>
                        </a>
                      )}
                    </div>

                    {currentUserRole === "admin" && (
                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          onClick={() => setIsEditingNode(true)}
                          className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white px-4 py-2 rounded-lg shadow"
                        >
                          ✏️ {t("Edit")}
                        </button>
                        <button
                          onClick={() => confirmDeleteNode(selectedNode)}
                          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-4 py-2 rounded-lg shadow"
                        >
                          🗑 {t("Delete")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  {/* Header with Member Info */}
                  <div className="flex items-center gap-4 mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                    <div className="w-12 h-12 rounded-full ring-2 ring-white dark:ring-gray-900 overflow-hidden shadow-lg">
                      {selectedNode.image ? (
                        <img src={selectedNode.image} alt={selectedNode.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t("Edit Member")}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Update member information and details</p>
                    </div>
                  </div>

                  <form onSubmit={handleEditNode} className="space-y-4">
                    {/* Horizontal Layout - Two Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Left Column - Basic Information */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                          <User className="w-4 h-4 text-indigo-600" />
                          {t("Basic Information")}
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              {t("Name")} <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={selectedNode.name || ""}
                              onChange={(e) => setSelectedNode((prev) => ({ ...prev, name: e.target.value }))}
                              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200"
                              placeholder={t("e.g. Jane Doe")}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              {t("Role")} <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={selectedNode.role || ""}
                              onChange={(e) => setSelectedNode((prev) => ({ ...prev, role: e.target.value }))}
                              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200"
                              placeholder={t("e.g. Product Manager")}
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t("Department")}
                              </label>
                              <input
                                type="text"
                                value={selectedNode.department || ""}
                                onChange={(e) => setSelectedNode((prev) => ({ ...prev, department: e.target.value }))}
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200"
                                placeholder={t("e.g. Engineering")}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t("Level")}
                              </label>
                              <select
                                value={selectedNode.level || 1}
                                onChange={(e) =>
                                  setSelectedNode((prev) => ({ ...prev, level: parseInt(e.target.value) }))
                                }
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200"
                              >
                                {levels.map((lvl) => (
                                  <option key={lvl} value={lvl}>
                                    {levelNames[lvl]} (L{lvl})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Contact & Image */}
                      <div className="space-y-4">
                        {/* Contact Information */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                          <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-green-600" />
                            {t("Contact Information")}
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <Mail className="w-3 h-3 inline mr-1" />
                                {t("Email")}
                              </label>
                              <input
                                type="email"
                                value={selectedNode.email || ""}
                                onChange={(e) => setSelectedNode((prev) => ({ ...prev, email: e.target.value }))}
                                className={`w-full rounded-lg border bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 transition-all duration-200 ${
                                  selectedNode.email && !isValidEmail(selectedNode.email)
                                    ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                                    : "border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-800"
                                }`}
                                placeholder={t("name@example.com")}
                              />
                              {selectedNode.email && !isValidEmail(selectedNode.email) && (
                                <p className="text-xs text-red-500 mt-1">Invalid email format</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <Phone className="w-3 h-3 inline mr-1" />
                                {t("Phone")}
                              </label>
                              <input
                                type="text"
                                value={selectedNode.phone || ""}
                                onChange={(e) => setSelectedNode((prev) => ({ ...prev, phone: e.target.value }))}
                                className={`w-full rounded-lg border bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 transition-all duration-200 ${
                                  selectedNode.phone && !isValidPhone(selectedNode.phone)
                                    ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                                    : "border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-800"
                                }`}
                                placeholder={t("e.g. +1 555 0100")}
                              />
                              {selectedNode.phone && !isValidPhone(selectedNode.phone) && (
                                <p className="text-xs text-red-500 mt-1">Invalid phone format</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Profile Image */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                          <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                            <User className="w-4 h-4 text-purple-600" />
                            {t("Profile Image")}
                          </h4>
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t("Image URL")}
                              </label>
                              <input
                                type="url"
                                value={selectedNode.image || ""}
                                onChange={(e) => setSelectedNode((prev) => ({ ...prev, image: e.target.value }))}
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200"
                                placeholder={t("https://...")}
                              />
                            </div>
                            {selectedNode.image && (
                              <div className="flex-shrink-0">
                                <p className="text-xs text-gray-500 mb-1">Preview:</p>
                                <img 
                                  src={selectedNode.image} 
                                  alt="Preview" 
                                  className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <button
                        type="button"
                        onClick={() => setIsEditingNode(false)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 transition-all duration-200 text-sm font-medium"
                      >
                        ❌ {t("Cancel")}
                      </button>
                      <button 
                        type="submit" 
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm font-medium"
                      >
                        ✅ {t("Save Changes")}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          )}

          {/* Delete Confirmation */}
          {deleteConfirm && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-sm text-center border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-200">
                Are you sure you want to delete {deleteConfirm.name}?
              </h2>
              <div className="flex justify-around">
                                 <button
                   onClick={handleDeleteNode}
                   className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-4 py-2 rounded-lg shadow"
                 >
                   🗑 Yes
                 </button>
                                 <button
                   onClick={() => setDeleteConfirm(null)}
                   className="inline-flex items-center gap-2 bg-gray-300 hover:bg-gray-400 active:bg-gray-500 text-gray-900 px-4 py-2 rounded-lg shadow"
                 >
                   ❌ No
                 </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile search (since top-right search is hidden on small screens) */}
      <div className="sm:hidden mt-4 mb-2 flex items-center gap-2">
        <div className="flex items-center bg-white/80 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full px-3 py-1 shadow w-full">
          <Search className="w-4 h-4 mr-1 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 w-full"
          />
        </div>
      </div>
    </div>
    </>

  );
};

export default LevelTree;
