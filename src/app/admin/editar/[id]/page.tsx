"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Upload, X } from "lucide-react";
import styles from "../../form.module.css";

export default function EditarProduct() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageTab, setImageTab] = useState<"upload" | "url">("url");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        if (res.ok) {
          const product = await res.json();
          setName(product.name);
          setDescription(product.description || "");
          setPrice(String(product.price));
          setImageUrl(product.imageUrl || "");
        } else {
          setError("Produto não encontrado.");
        }
      } catch {
        setError("Erro ao carregar produto.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.url);
      } else {
        setError("Erro ao fazer upload da imagem.");
      }
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/products/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price,
          imageUrl: imageUrl || null,
        }),
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        setError("Erro ao atualizar produto.");
      }
    } catch {
      setError("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <div className={styles.spinner} style={{ width: 36, height: 36, border: "3px solid #e8e4dc", borderTopColor: "#81C784", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/admin" className={styles.backButton}>
            <ArrowLeft size={20} />
          </Link>
          <h1 className={styles.title}>Editar Produto</h1>
        </div>
      </header>

      <main className={styles.main}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Nome do Produto</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Camiseta Premium"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o produto em detalhes..."
              className={styles.textarea}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Preço (R$)</label>
            <div className={styles.priceInput}>
              <span className={styles.pricePrefix}>R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0,00"
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Imagem</label>
            <div className={styles.imageSection}>
              <div className={styles.imageTabs}>
                <button
                  type="button"
                  className={`${styles.imageTab} ${imageTab === "upload" ? styles.imageTabActive : ""}`}
                  onClick={() => setImageTab("upload")}
                >
                  Upload
                </button>
                <button
                  type="button"
                  className={`${styles.imageTab} ${imageTab === "url" ? styles.imageTabActive : ""}`}
                  onClick={() => setImageTab("url")}
                >
                  URL Externa
                </button>
              </div>

              {imageTab === "upload" ? (
                <>
                  {!imageUrl && !uploading && (
                    <div
                      className={styles.uploadArea}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={32} className={styles.uploadIcon} />
                      <p className={styles.uploadText}>Clique para enviar uma imagem</p>
                      <p className={styles.uploadHint}>PNG, JPG ou WebP (máx. 4.5MB)</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className={styles.hiddenInput}
                  />
                </>
              ) : (
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className={styles.input}
                />
              )}

              {uploading && (
                <div className={styles.uploading}>
                  Enviando imagem...
                </div>
              )}

              {imageUrl && (
                <div className={styles.preview}>
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    className={styles.previewImage}
                    sizes="700px"
                  />
                  <button
                    type="button"
                    className={styles.removePreview}
                    onClick={() => setImageUrl("")}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={saving}
          >
            {saving ? "Salvando..." : "Atualizar Produto"}
          </button>
        </form>
      </main>
    </div>
  );
}
