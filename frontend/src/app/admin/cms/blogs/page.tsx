"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useData } from "@/context/DataContext";
import { useRouter } from "next/navigation";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  readTime: string;
  imageUrl: string;
  status: "Published" | "Draft" | "Archived";
  isFeatured: boolean;
  publishedAt: string;
}

const DEFAULT_BLOGS: BlogPost[] = [
  {
    id: "BLOG-101",
    title: "Top 10 Hidden Beaches in South Goa You Must Visit",
    slug: "top-10-hidden-beaches-south-goa",
    excerpt: "Ditch the crowded beaches of North Goa and head south to discover quiet shores, pristine waters, and absolute tranquility.",
    content: "South Goa is known for its serene coastline, palm-fringed shores, and slow-paced lifestyle. While popular spots like Palolem and Colva draw crowds, there are numerous secret coves and pristine beaches waiting to be discovered. In this comprehensive guide, we cover Cola Beach with its freshwater lagoon, Butterfly Beach accessible via boat ride or forest hike, Kakolem Beach (often called the Tiger Beach), and Galgibaga, the nesting site of Olive Ridley turtles. Learn how to reach them, when to visit, and what local delicacies to try nearby...",
    author: "Sarah Jenkins",
    category: "Destination Guides",
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    status: "Published",
    isFeatured: true,
    publishedAt: "2026-06-15"
  },
  {
    id: "BLOG-102",
    title: "How to Travel Europe on a Backpacker Budget in 2026",
    slug: "travel-europe-backpacker-budget-2026",
    excerpt: "Expert advice on Eurail passes, hostel booking hacks, budget airlines, and finding delicious cheap eats across European capitals.",
    content: "Traveling through Europe doesn't have to break the bank. With the right planning, you can experience historic cities, breathtaking landscapes, and rich cultures on a budget. First, consider traveling during the shoulder seasons (April-May and September-October) when flights and accommodations are significantly cheaper. Utilize hostel booking applications to find top-rated stays with free breakfasts. For transport, compare Eurail passes with budget bus lines like FlixBus and low-cost carriers. Don't forget to take advantage of free walking tours and local supermarket picnics...",
    author: "Alex Rivera",
    category: "Travel Tips",
    readTime: "8 min read",
    imageUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80",
    status: "Published",
    isFeatured: false,
    publishedAt: "2026-06-10"
  },
  {
    id: "BLOG-103",
    title: "The Ultimate Guide to Kyoto's Autumn Leaves",
    slug: "ultimate-guide-kyoto-autumn-leaves",
    excerpt: "A curated list of temples and gardens in Kyoto that offer the most spectacular displays of autumn colors (koyo) alongside key travel tips.",
    content: "Kyoto is famous for its cherry blossoms, but the autumn maple leaves (known as Koyo) are equally spectacular. From mid-November to early December, temples like Kiyomizu-dera, Tofuku-ji, and Eikan-do transform into seas of vibrant red, orange, and yellow. To make the most of your trip, start your days early to beat the crowds at popular sites. Consider purchasing a Kansai Thru Pass for seamless transport across buses and subways. Don't miss out on night illuminations, where select temples light up their gardens, creating a fairytale reflection in ponds...",
    author: "Miki Sato",
    category: "Culture & Food",
    readTime: "5 min read",
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    status: "Draft",
    isFeatured: false,
    publishedAt: "2026-06-20"
  }
];

const CATEGORIES = ["Destination Guides", "Travel Tips", "Culture & Food", "Luxury Travel", "Adventure Tours"];

export default function BlogCMSPage() {
  const router = useRouter();
  const { activeAdmin, addLog } = useData();

  // Blog State
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // View States
  const [currentView, setCurrentView] = useState<"list" | "compose" | "edit" | "preview">("list");
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  // Form State for Composer
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "",
    category: CATEGORIES[0],
    readTime: "5 min read",
    imageUrl: "",
    status: "Draft" as "Published" | "Draft" | "Archived",
    isFeatured: false
  });

  // Admin Guard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("met_admin_session");
      if (!stored && !activeAdmin) {
        router.push("/admin/login");
      }
    }
  }, [activeAdmin, router]);

  // Initial Load from LocalStorage
  useEffect(() => {
    const storedBlogs = localStorage.getItem("met_blogs");
    if (storedBlogs) {
      try {
        setBlogs(JSON.parse(storedBlogs));
      } catch (e) {
        setBlogs(DEFAULT_BLOGS);
      }
    } else {
      localStorage.setItem("met_blogs", JSON.stringify(DEFAULT_BLOGS));
      setBlogs(DEFAULT_BLOGS);
    }
  }, []);

  const saveBlogs = (updatedBlogs: BlogPost[]) => {
    setBlogs(updatedBlogs);
    localStorage.setItem("met_blogs", JSON.stringify(updatedBlogs));
  };

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  // Open Composer for New Post
  const handleNewPost = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      author: activeAdmin?.fullName || "Admin Editor",
      category: CATEGORIES[0],
      readTime: "5 min read",
      imageUrl: "",
      status: "Draft",
      isFeatured: false
    });
    setCurrentView("compose");
  };

  // Open Edit Mode
  const handleEditClick = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      author: blog.author,
      category: blog.category,
      readTime: blog.readTime,
      imageUrl: blog.imageUrl,
      status: blog.status,
      isFeatured: blog.isFeatured
    });
    setCurrentView("edit");
  };

  // Open Preview Mode
  const handlePreviewClick = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setCurrentView("preview");
  };

  // Save New/Edited Post
  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Please fill in the title and content.");
      return;
    }

    if (currentView === "compose") {
      const newPost: BlogPost = {
        id: "BLOG-" + Math.floor(Math.random() * 900 + 100),
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        excerpt: formData.excerpt || formData.content.substring(0, 150) + "...",
        content: formData.content,
        author: formData.author,
        category: formData.category,
        readTime: formData.readTime,
        imageUrl: formData.imageUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
        status: formData.status,
        isFeatured: formData.isFeatured,
        publishedAt: formData.status === "Published" ? new Date().toISOString().split("T")[0] : "-"
      };

      const updated = [newPost, ...blogs];
      saveBlogs(updated);
      if (addLog) addLog(`BLOG_CMS: Created new blog post: "${newPost.title}" (${newPost.id})`);
      alert("Blog post created successfully!");
    } else if (currentView === "edit" && selectedBlog) {
      const updated = blogs.map((b) => {
        if (b.id === selectedBlog.id) {
          return {
            ...b,
            title: formData.title,
            slug: formData.slug || generateSlug(formData.title),
            excerpt: formData.excerpt || formData.content.substring(0, 150) + "...",
            content: formData.content,
            author: formData.author,
            category: formData.category,
            readTime: formData.readTime,
            imageUrl: formData.imageUrl || b.imageUrl,
            status: formData.status,
            isFeatured: formData.isFeatured,
            publishedAt:
              formData.status === "Published" && b.status !== "Published"
                ? new Date().toISOString().split("T")[0]
                : b.publishedAt
          };
        }
        return b;
      });
      saveBlogs(updated);
      if (addLog) addLog(`BLOG_CMS: Updated blog post: "${formData.title}" (${selectedBlog.id})`);
      alert("Blog post updated successfully!");
    }

    setCurrentView("list");
    setSelectedBlog(null);
  };

  // Delete Post
  const handleDeletePost = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the blog post "${title}"?`)) {
      const updated = blogs.filter((b) => b.id !== id);
      saveBlogs(updated);
      if (addLog) addLog(`BLOG_CMS: Deleted blog post ID ${id}`);
    }
  };

  // Toggle Featured status
  const handleToggleFeatured = (id: string, title: string) => {
    const updated = blogs.map((b) => {
      if (b.id === id) {
        const nextState = !b.isFeatured;
        if (addLog) addLog(`BLOG_CMS: Toggled featured status on "${title}" to ${nextState}`);
        return { ...b, isFeatured: nextState };
      }
      return b;
    });
    saveBlogs(updated);
  };

  // Toggle Quick Status Change
  const handleQuickStatus = (id: string, newStatus: BlogPost["status"]) => {
    const updated = blogs.map((b) => {
      if (b.id === id) {
        if (addLog) addLog(`BLOG_CMS: Changed status of "${b.title}" to ${newStatus}`);
        return {
          ...b,
          status: newStatus,
          publishedAt: newStatus === "Published" ? new Date().toISOString().split("T")[0] : b.publishedAt
        };
      }
      return b;
    });
    saveBlogs(updated);
  };

  // Filtering Logic
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory;
    const matchesStatus = selectedStatus === "All" || blog.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate quick stats
  const totalPosts = blogs.length;
  const publishedPosts = blogs.filter((b) => b.status === "Published").length;
  const draftPosts = blogs.filter((b) => b.status === "Draft").length;
  const featuredPosts = blogs.filter((b) => b.isFeatured).length;

  return (
    <AdminLayout
      title="Blog Post Registry & Composer"
      subtitle="Publish travel guides, news, budget tips, itineraries, and stories to travelers."
      actionButton={
        currentView === "list" && (
          <button onClick={handleNewPost} className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shadow-sm">
            <i className="fa-solid fa-plus text-sm"></i> Write New Post
          </button>
        )
      }
    >
      {/* Overview Cards (Only in List View) */}
      {currentView === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 border border-border rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Total Articles</p>
                <h3 className="text-xl font-extrabold text-primary mt-1">{totalPosts}</h3>
              </div>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <i className="fa-solid fa-book-open"></i>
              </div>
            </div>
            <p className="text-[10px] text-text-muted mt-2">Active items in storage</p>
          </div>

          <div className="bg-white p-4 border border-border rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Published</p>
                <h3 className="text-xl font-extrabold text-emerald-600 mt-1">{publishedPosts}</h3>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <i className="fa-solid fa-circle-check"></i>
              </div>
            </div>
            <p className="text-[10px] text-emerald-600 mt-2 font-bold">• Active on consumer site</p>
          </div>

          <div className="bg-white p-4 border border-border rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Drafts</p>
                <h3 className="text-xl font-extrabold text-amber-500 mt-1">{draftPosts}</h3>
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                <i className="fa-solid fa-file-signature"></i>
              </div>
            </div>
            <p className="text-[10px] text-text-muted mt-2">Awaiting review / layout</p>
          </div>

          <div className="bg-white p-4 border border-border rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Featured Posts</p>
                <h3 className="text-xl font-extrabold text-orange-500 mt-1">{featuredPosts}</h3>
              </div>
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                <i className="fa-solid fa-star"></i>
              </div>
            </div>
            <p className="text-[10px] text-text-muted mt-2">Highlighted on homepage</p>
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {currentView === "list" && (
        <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden font-sans">
          {/* Filters Bar */}
          <div className="p-4 border-b border-border flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-50">
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted text-xs">
                <i className="fa-solid fa-magnifying-glass"></i>
              </span>
              <input
                type="text"
                placeholder="Search by title, excerpt, author..."
                className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-xs outline-none focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
              <select
                className="border border-border p-2 rounded-lg text-xs outline-none bg-white text-text-main"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                className="border border-border p-2 rounded-lg text-xs outline-none bg-white text-text-main"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Table list of blogs */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-border text-primary font-bold">
                  <th className="p-4">Cover Image & Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Author</th>
                  <th className="p-4 text-center">Featured</th>
                  <th className="p-4">Publish Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-text-muted">
                      No blog articles found matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBlogs.map((blog) => (
                    <tr key={blog.id} className="border-b border-border hover:bg-slate-50 transition-colors">
                      <td className="p-4 max-w-sm">
                        <div className="flex items-center gap-3">
                          <img
                            src={blog.imageUrl}
                            alt={blog.title}
                            className="w-12 h-12 object-cover rounded border border-border"
                          />
                          <div>
                            <h4 className="font-extrabold text-primary line-clamp-1">{blog.title}</h4>
                            <p className="text-[10px] text-text-muted mt-0.5 font-mono">ID: {blog.id} | /{blog.slug}</p>
                            <p className="text-[10px] text-text-muted line-clamp-1 mt-0.5">{blog.excerpt}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-semibold text-primary">
                          {blog.category}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-text-main">{blog.author}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(blog.id, blog.title)}
                          className={`text-base ${blog.isFeatured ? "text-orange-500" : "text-slate-300 hover:text-slate-400"}`}
                          title={blog.isFeatured ? "Featured Article" : "Make Featured"}
                        >
                          <i className="fa-solid fa-star"></i>
                        </button>
                      </td>
                      <td className="p-4 font-mono text-[10px] text-text-muted">{blog.publishedAt}</td>
                      <td className="p-4">
                        <select
                          className={`p-1 rounded text-[10px] font-bold border outline-none bg-white ${
                            blog.status === "Published"
                              ? "text-emerald-700 border-emerald-200"
                              : blog.status === "Draft"
                              ? "text-amber-700 border-amber-200"
                              : "text-slate-500 border-slate-200"
                          }`}
                          value={blog.status}
                          onChange={(e) => handleQuickStatus(blog.id, e.target.value as any)}
                        >
                          <option value="Published">Published</option>
                          <option value="Draft">Draft</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handlePreviewClick(blog)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 p-1.5 rounded transition"
                            title="Preview Post"
                          >
                            <i className="fa-solid fa-eye"></i>
                          </button>
                          <button
                            onClick={() => handleEditClick(blog)}
                            className="bg-slate-100 hover:bg-slate-200 text-primary p-1.5 rounded transition"
                            title="Edit Post"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            onClick={() => handleDeletePost(blog.id, blog.title)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded transition"
                            title="Delete Post"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COMPOSER / EDIT VIEW */}
      {(currentView === "compose" || currentView === "edit") && (
        <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden font-sans">
          <div className="p-4 border-b border-border bg-slate-50 flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-primary">
              {currentView === "compose" ? "Compose Blog Article" : `Edit Article: ${selectedBlog?.id}`}
            </h3>
            <button
              onClick={() => {
                setCurrentView("list");
                setSelectedBlog(null);
              }}
              className="text-xs text-text-muted hover:text-primary font-bold"
            >
              <i className="fa-solid fa-arrow-left mr-1"></i> Back to Registry
            </button>
          </div>

          <form onSubmit={handleSavePost} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Fields Area */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Article Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10 Secrets to Travel Cheap in Europe"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="border border-border p-2.5 rounded-lg text-xs outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-text-muted font-bold uppercase">URL Slug (Auto-generated)</label>
                    <input
                      type="text"
                      placeholder="e.g. secrets-to-travel-cheap"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="border border-border p-2.5 rounded-lg text-xs outline-none focus:border-primary font-mono text-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-text-muted font-bold uppercase">Author *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="border border-border p-2.5 rounded-lg text-xs outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Short Excerpt (SEO Summary) *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Provide a snappy summary description of the article for list cards and search engines..."
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="border border-border p-2.5 rounded-lg text-xs outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Article Content (Markdown/HTML friendly text) *</label>
                  <textarea
                    required
                    rows={12}
                    placeholder="Write your blog content here. You can layout details, include paragraphs, listicles, or paste guide transcripts..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="border border-border p-3 rounded-lg text-xs outline-none focus:border-primary font-serif leading-relaxed"
                  />
                </div>
              </div>

              {/* Sidebar Settings Area */}
              <div className="flex flex-col gap-4 bg-slate-50 p-4 rounded-lg border border-border h-fit">
                <h4 className="font-bold text-xs text-primary border-b border-border pb-2">Publishing Settings</h4>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Category</label>
                  <select
                    className="border border-border p-2 rounded-lg text-xs outline-none bg-white text-text-main"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Estimated Read Time</label>
                  <input
                    type="text"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    placeholder="e.g. 5 min read"
                    className="border border-border p-2 rounded-lg text-xs outline-none bg-white text-text-main"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Featured Image URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/... or media path"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="border border-border p-2 rounded-lg text-xs outline-none bg-white text-text-main"
                  />
                  {formData.imageUrl && (
                    <div className="mt-2 w-full h-24 rounded overflow-hidden border border-border bg-slate-200">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted font-bold uppercase">Publication Status</label>
                  <select
                    className="border border-border p-2 rounded-lg text-xs outline-none bg-white text-text-main font-bold"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="Draft">Draft (Hidden)</option>
                    <option value="Published">Published (Live)</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 border border-border bg-white p-3 rounded-lg mt-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-primary accent-primary"
                  />
                  <label htmlFor="isFeatured" className="text-xs font-bold text-primary cursor-pointer select-none">
                    Feature on Homepage Carousel
                  </label>
                </div>

                <div className="pt-4 border-t border-border mt-4 flex flex-col gap-2">
                  <button type="submit" className="btn-primary w-full justify-center py-2.5 text-xs font-bold rounded-lg shadow-sm">
                    <i className="fa-solid fa-save mr-1"></i> Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView("list");
                      setSelectedBlog(null);
                    }}
                    className="w-full py-2.5 text-xs border border-border bg-white hover:bg-slate-100 text-text-main rounded-lg font-bold transition text-center"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* PREVIEW VIEW */}
      {currentView === "preview" && selectedBlog && (
        <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden max-w-4xl mx-auto font-sans">
          <div className="p-4 border-b border-border bg-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold">
                {selectedBlog.category}
              </span>
              <span className={`text-[10px] font-bold ${selectedBlog.status === "Published" ? "text-emerald-600" : "text-amber-500"}`}>
                • {selectedBlog.status}
              </span>
            </div>
            <button
              onClick={() => {
                setCurrentView("list");
                setSelectedBlog(null);
              }}
              className="text-xs text-text-muted hover:text-primary font-bold"
            >
              <i className="fa-solid fa-arrow-left mr-1"></i> Back to Registry
            </button>
          </div>

          <div className="relative h-64 md:h-96 w-full bg-slate-200">
            <img src={selectedBlog.imageUrl} alt={selectedBlog.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8 text-white">
              <h2 className="text-xl md:text-3xl font-extrabold font-heading leading-tight">{selectedBlog.title}</h2>
              <div className="flex items-center gap-4 text-xs mt-3 text-slate-300">
                <span>By <strong className="text-white">{selectedBlog.author}</strong></span>
                <span>•</span>
                <span>{selectedBlog.readTime}</span>
                <span>•</span>
                <span>Published: {selectedBlog.publishedAt}</span>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <p className="text-sm font-bold text-text-main italic border-l-4 border-primary pl-4 mb-6 leading-relaxed">
              "{selectedBlog.excerpt}"
            </p>
            <div className="text-xs text-text-main leading-relaxed space-y-4 font-serif whitespace-pre-line text-justify">
              {selectedBlog.content}
            </div>

            <div className="border-t border-border mt-8 pt-6 flex justify-between items-center text-xs">
              <span className="text-text-muted font-mono">Article System Identifier: {selectedBlog.id}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(selectedBlog)}
                  className="bg-primary text-white font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-[#081b49] transition"
                >
                  <i className="fa-solid fa-pen-to-square mr-1"></i> Edit Article
                </button>
                <button
                  onClick={() => {
                    setCurrentView("list");
                    setSelectedBlog(null);
                  }}
                  className="border border-border bg-white text-text-main hover:bg-slate-100 font-bold px-4 py-2 rounded-lg transition"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
