"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Upload, X } from "lucide-react";
import styles from "../form.module.css";

export default function NovoProduct() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageTab, setImageTab] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState("amigurumis");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 4) {
      setError("Limite de 4 fotos atingido.");
      return;
    }

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
        setImages([...images, data.url]);
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao fazer upload da imagem.");
      }
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const addUrlImage = () => {
    if (!urlInput) return;
    if (images.length >= 4) {
      setError("Limite de 4 fotos atingido.");
      return;
    }
    setImages([...images, urlInput]);
    setUrlInput("");
    setError("");
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price,
          images,
          category,
        }),
      });

      if (res.ok) {
        router.push("/gestor");
      } else {
        setError("Erro ao salvar produto. Verifique os campos.");
      }
    } catch {
      setError("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/gestor" className={styles.backButton}>
            <ArrowLeft size={20} />
          </Link>
          <h1 className={styles.title}>Novo Produto</h1>
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
              placeholder="Ex: Ursinho de Crochê"
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
            <label className={styles.label}>Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={styles.input}
              required
            >
              <option value="amigurumis">Amigurumis</option>
              <option value="roupas">Roupas</option>
              <option value="bolsas_acessorios">Bolsas e Acessórios</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Imagens (Máx. 4)</label>
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
                <div 
                  className={`${styles.uploadArea} ${images.length >= 4 ? styles.uploadDisabled : ""}`}
                  onClick={() => images.length < 4 && fileInputRef.current?.click()}
                >
                  <Upload size={32} className={styles.uploadIcon} />
                  <p className={styles.uploadText}>
                    {images.length >= 4 ? "Limite atingido" : "Clique para enviar"}
                  </p>
                  <p className={styles.uploadHint}>{images.length}/4 fotos</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className={styles.hiddenInput}
                    disabled={images.length >= 4}
                  />
                </div>
              ) : (
                <div style={{ display: "flex", gap: "8.1px" }}>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className={styles.input}
                    style={{ flex: 1 }}
                  />
                  <button 
                    type="button" 
                    onClick={addUrlImage}
                    className={styles.addButton}
                    disabled={images.length >= 4}
                  >
                    Adicionar
                  </button>
                </div>
              )}

              {uploading && (
                <div className={styles.uploading}>
                  Enviando imagem...
                </div>
              )}

              <div className={styles.imagesGrid}>
                {images.map((url, index) => (
                  <div key={index} className={styles.imageSlot}>
                    <Image
                      src={url}
                      alt={`Preview ${index + 1}`}
                      fill
                      className={styles.previewImage}
                      sizes="200px"
                    />
                    <button
                      type="button"
                      className={styles.removeSlot}
                      onClick={() => removeImage(index)}
                    >
                      <X size={14} />
                    </button>
                    {index === 0 && (
                      <div className={styles.mainSlotBadge}>Principal</div>
                    )}
                  </div>
                ))}
                
                {Array.from({ length: Math.max(0, 4 - images.length) }).map((_, i) => (
                  <div key={`empty-${i}`} className={`${styles.imageSlot} ${styles.imageSlotEmpty}`} onClick={() => imageTab === "upload" && fileInputRef.current?.click()}>
                    <Upload size={20} className={styles.slotIcon} />
                    <span className={styles.slotText}>Vazio</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={saving || images.length === 0}
          >
            {saving ? "Salvando..." : "Salvar Produto"}
          </button>
        </form>
      </main>
    </div>
  );
}
