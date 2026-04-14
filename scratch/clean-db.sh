#!/bin/bash
# Backup current structure just in case
mysqldump -h31.97.106.134 -urootdev -p'@Alkuja07' db_bauk --no-data > /www/apps/sikump/db_backup_structure.sql

# Create Activity Logs Table if missing
mysql -h31.97.106.134 -urootdev -p'@Alkuja07' db_bauk -e "
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nik_operator VARCHAR(20),
  nama_operator VARCHAR(100),
  aksi VARCHAR(255),
  target_nik VARCHAR(20),
  detail TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"

# DROP UNUSED TABLES
mysql -h31.97.106.134 -urootdev -p'@Alkuja07' db_bauk -e "
DROP TABLE IF EXISTS barang;
DROP TABLE IF EXISTS distribusi;
DROP TABLE IF EXISTS tmst_apbu_pemasukan;
DROP TABLE IF EXISTS tmst_apbu_pengeluaran;
DROP TABLE IF EXISTS tmst_bku;
DROP TABLE IF EXISTS tmst_distribusi;
DROP TABLE IF EXISTS tmst_lra_biaya;
DROP TABLE IF EXISTS tmst_lra_pendapatan;
DROP TABLE IF EXISTS tmst_periksa;
DROP TABLE IF EXISTS tmst_rka;
DROP TABLE IF EXISTS tmst_rka_biaya;
DROP TABLE IF EXISTS tmst_rka_pendapatan;
DROP TABLE IF EXISTS tref_akun;
DROP TABLE IF EXISTS tref_anggaran;
DROP TABLE IF EXISTS tref_apbu_biaya;
DROP TABLE IF EXISTS tref_apbu_jenis_biaya;
DROP TABLE IF EXISTS tref_apbu_pendapatan;
DROP TABLE IF EXISTS tref_apbu_sub_biaya;
DROP TABLE IF EXISTS tref_aset;
DROP TABLE IF EXISTS tref_kondisi;
DROP TABLE IF EXISTS tref_subakun;
DROP TABLE IF EXISTS tref_timex;
DROP VIEW IF EXISTS v_jabatan;
DROP VIEW IF EXISTS v_jafung;
DROP VIEW IF EXISTS v_pendidikan_dosen;
DROP VIEW IF EXISTS v_pendidkan_kar;
"
echo "Cleanup complete. Backup structure saved to /www/apps/sikump/db_backup_structure.sql"
