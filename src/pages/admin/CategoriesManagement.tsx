import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { adminService } from "@/services";
import type { AdminCategory, PaginationMeta } from "@/services";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit3,
  Trash2,
  Loader2,
  FolderTree,
  Tag,
  Users,
  Briefcase,
  CheckCircle,
  Save,
} from "lucide-react";

const CategoriesManagement = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editCategory, setEditCategory] = useState<AdminCategory | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", description: "", icon: "" });
  const [newSkill, setNewSkill] = useState("");
  const limit = 15;

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const data = await adminService.getAllCategories(params);
      setCategories(data.categories || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const handleCreate = async () => {
    if (!newCategory.name.trim()) return;
    try {
      setProcessing("create");
      await adminService.createCategory(newCategory);
      setShowCreateModal(false);
      setNewCategory({ name: "", description: "", icon: "" });
      fetchCategories();
    } catch (err) {
      console.error("Failed to create category:", err);
    } finally {
      setProcessing(null);
    }
  };

  const handleUpdate = async () => {
    if (!editCategory || !editCategory.name.trim()) return;
    try {
      setProcessing(editCategory._id);
      await adminService.updateCategory(editCategory._id, { name: editCategory.name, description: editCategory.description, isActive: editCategory.isActive });
      setEditCategory(null);
      fetchCategories();
    } catch (err) {
      console.error("Failed to update category:", err);
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm("Delete this category and all its skills?")) return;
    try {
      setProcessing(categoryId);
      await adminService.deleteCategory(categoryId);
      fetchCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);
    } finally {
      setProcessing(null);
    }
  };

  const handleAddSkill = async (categoryId: string) => {
    if (!newSkill.trim()) return;
    try {
      await adminService.addSkill(categoryId, { name: newSkill.trim() });
      setNewSkill("");
      fetchCategories();
    } catch (err) {
      console.error("Failed to add skill:", err);
    }
  };

  const handleRemoveSkill = async (categoryId: string, skillId: string) => {
    try {
      await adminService.removeSkill(categoryId, skillId);
      fetchCategories();
    } catch (err) {
      console.error("Failed to remove skill:", err);
    }
  };

  const stats = [
    { label: "Total Categories", value: pagination?.totalItems ?? categories.length, icon: FolderTree, color: "indigo" },
    { label: "Active", value: categories.filter(c => c.isActive).length, icon: CheckCircle, color: "emerald" },
    { label: "Total Skills", value: categories.reduce((acc, c) => acc + (c.skills?.length || 0), 0), icon: Tag, color: "cyan" },
  ];

  const ModalOverlay = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
    <div className="um-slideover-overlay open" onClick={onClose}>
      <div className="um-slideover open" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        {children}
      </div>
    </div>
  );

  return (
    <AdminLayout title="Categories & Skills" breadcrumb="Manage Skills">
      <div className="admin-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div className="admin-metrics-grid" style={{ flex: 1, marginBottom: 0 }}>
            {stats.map((s) => (
              <div key={s.label} className={`um-stat-card ${s.color}`}>
                <div className="um-stat-icon"><s.icon size={20} /></div>
                <div className="um-stat-info">
                  <div className="um-stat-value">{s.value}</div>
                  <div className="um-stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", gap: "1rem" }}>
          <div className="um-search-wrapper" style={{ flex: 1, maxWidth: 320 }}>
            <Search size={18} className="um-search-icon" />
            <input type="text" placeholder="Search categories..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="um-search-input" />
            {searchQuery && <button className="um-search-clear" onClick={() => setSearchQuery("")}><X size={16} /></button>}
          </div>
          <button className="admin-btn admin-btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} /> Add Category
          </button>
        </div>

        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "4rem 0" }}>
              <Loader2 size={32} style={{ color: "var(--admin-indigo)", animation: "spin 1s linear infinite" }} />
            </div>
          ) : categories.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 1.5rem" }}>
              <FolderTree size={48} style={{ color: "var(--admin-cloud-gray)", margin: "0 auto 1rem", display: "block" }} />
              <p style={{ color: "var(--admin-white)", fontSize: "1.125rem" }}>No categories yet</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 0 }}>
              {categories.map((cat) => (
                <div key={cat._id} style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--admin-border)", borderRight: "1px solid var(--admin-border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <h3 style={{ color: "var(--admin-white)", fontSize: "1rem", fontWeight: 600, margin: 0 }}>{cat.name}</h3>
                        <span className={`admin-status-badge ${cat.isActive ? "completed" : "cancelled"}`}>
                          {cat.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      {cat.description && (
                        <p style={{ color: "var(--admin-cloud-gray)", fontSize: "0.8125rem", margin: "4px 0 0" }}>{cat.description}</p>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      <button className="um-actions-btn" onClick={() => setEditCategory(cat)} title="Edit"><Edit3 size={14} /></button>
                      <button className="um-actions-btn" onClick={() => handleDelete(cat._id)} title="Delete" disabled={processing === cat._id}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--admin-cloud-gray)", fontSize: "0.8125rem" }}>
                      <Briefcase size={14} /> {cat.projectCount || 0} projects
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--admin-cloud-gray)", fontSize: "0.8125rem" }}>
                      <Users size={14} /> {cat.freelancerCount || 0} freelancers
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginBottom: "0.5rem" }}>
                      {(cat.skills || []).map((skill) => (
                        <span key={skill._id} style={{
                          display: "inline-flex", alignItems: "center", gap: "0.25rem",
                          padding: "2px 8px", borderRadius: "9999px",
                          background: "rgba(99,102,241,0.1)", color: "var(--admin-indigo)",
                          fontSize: "0.75rem", fontWeight: 500,
                        }}>
                          {skill.name}
                          <button
                            onClick={() => handleRemoveSkill(cat._id, skill._id)}
                            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0, lineHeight: 1 }}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: "0.375rem" }}>
                      <input
                        type="text"
                        placeholder="Add skill..."
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleAddSkill(cat._id); }}
                        style={{
                          flex: 1, padding: "4px 8px", fontSize: "0.75rem",
                          background: "var(--admin-dark-navy)", border: "1px solid var(--admin-border)",
                          borderRadius: 6, color: "var(--admin-white)", outline: "none",
                        }}
                      />
                      <button
                        onClick={() => handleAddSkill(cat._id)}
                        style={{
                          padding: "4px 10px", fontSize: "0.75rem",
                          background: "var(--admin-indigo)", border: "none",
                          borderRadius: 6, color: "white", cursor: "pointer", fontWeight: 500,
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", borderTop: "1px solid var(--admin-border)" }}>
              <span style={{ color: "var(--admin-cloud-gray)", fontSize: "0.875rem" }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="admin-btn admin-btn-outline admin-btn-sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeft size={16} /> Prev
                </button>
                <button className="admin-btn admin-btn-outline admin-btn-sm" disabled={currentPage >= pagination.totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <ModalOverlay onClose={() => setShowCreateModal(false)}>
          <div className="um-slideover-header" style={{ borderBottom: "1px solid var(--admin-border)", paddingBottom: "1rem" }}>
            <button className="um-slideover-close" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
            <h3 style={{ color: "var(--admin-white)", fontSize: "1.25rem", fontWeight: 700 }}>Create Category</h3>
          </div>
          <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <InputField label="Name" value={newCategory.name} onChange={(v) => setNewCategory({ ...newCategory, name: v })} />
            <InputField label="Description" value={newCategory.description} onChange={(v) => setNewCategory({ ...newCategory, description: v })} textarea />
            <InputField label="Icon (emoji or icon name)" value={newCategory.icon} onChange={(v) => setNewCategory({ ...newCategory, icon: v })} />
          </div>
          <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--admin-border)", display: "flex", gap: "0.75rem" }}>
            <button className="admin-btn admin-btn-outline admin-btn-sm" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>Cancel</button>
            <button className="admin-btn admin-btn-primary admin-btn-sm" style={{ flex: 1 }} onClick={handleCreate} disabled={processing === "create" || !newCategory.name.trim()}>
              <Plus size={14} /> Create
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* Edit Modal */}
      {editCategory && (
        <ModalOverlay onClose={() => setEditCategory(null)}>
          <div className="um-slideover-header" style={{ borderBottom: "1px solid var(--admin-border)", paddingBottom: "1rem" }}>
            <button className="um-slideover-close" onClick={() => setEditCategory(null)}><X size={20} /></button>
            <h3 style={{ color: "var(--admin-white)", fontSize: "1.25rem", fontWeight: 700 }}>Edit Category</h3>
          </div>
          <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <InputField label="Name" value={editCategory.name} onChange={(v) => setEditCategory({ ...editCategory, name: v })} />
            <InputField label="Description" value={editCategory.description || ""} onChange={(v) => setEditCategory({ ...editCategory, description: v })} textarea />
            <div>
              <label style={{ color: "var(--admin-cloud-gray)", fontSize: "0.8125rem", fontWeight: 600, display: "block", marginBottom: 6 }}>Active</label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={editCategory.isActive}
                  onChange={(e) => setEditCategory({ ...editCategory, isActive: e.target.checked })}
                  style={{ accentColor: "var(--admin-indigo)" }}
                />
                <span style={{ color: "var(--admin-white)", fontSize: "0.875rem" }}>Category is active and visible</span>
              </label>
            </div>
          </div>
          <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--admin-border)", display: "flex", gap: "0.75rem" }}>
            <button className="admin-btn admin-btn-outline admin-btn-sm" style={{ flex: 1 }} onClick={() => setEditCategory(null)}>Cancel</button>
            <button className="admin-btn admin-btn-primary admin-btn-sm" style={{ flex: 1 }} onClick={handleUpdate} disabled={processing === editCategory._id || !editCategory.name.trim()}>
              <Save size={14} /> Save
            </button>
          </div>
        </ModalOverlay>
      )}
    </AdminLayout>
  );
};

const InputField = ({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) => (
  <div>
    <label style={{ color: "var(--admin-cloud-gray)", fontSize: "0.8125rem", fontWeight: 600, display: "block", marginBottom: 6 }}>{label}</label>
    {textarea ? (
      <textarea value={value} onChange={(e) => onChange(e.target.value)} className="admin-search-input" style={{ width: "100%", minHeight: 80, resize: "vertical" }} />
    ) : (
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="admin-search-input" style={{ width: "100%" }} />
    )}
  </div>
);

export default CategoriesManagement;