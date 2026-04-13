<?php defined('BASEPATH') or exit('No direct script access allowed');
class Model_karyawan extends CI_Model
{
    function __construct()
    {
        parent::__construct();
    }
    function get_karyawan()
    {
        $hasil = $this->db->get('tmst_karyawan');
        return $hasil->result_array();
        //return $this->$hasil->affected_rows();
    }
    function get_profil($nik)
    {
        $hasil = $this->db->query("SELECT
                            tmst_karyawan.nik,
                            tmst_karyawan.nama,
                            tmst_karyawan.tempat_lahir,
                            tmst_karyawan.tanggal_lahir,
                            tmst_karyawan.jenis_kelamin,
                            tmst_karyawan.agama,
                            tmst_karyawan.nomor_ktp,
                            tmst_karyawan.alamat,
                            tmst_karyawan.telepon,
                            tmst_karyawan.pp,
                            tmst_karyawan.upload_ktp,
                            tmst_karyawan.status_aktif,
                            riwayat_keluarga.status_perkawinan,
                            riwayat_keluarga.id_anak,
                            riwayat_keluarga.nama_ismi,
                            riwayat_keluarga.pekerjaan_ismi,
                            riwayat_keluarga.upload_kk,
                            riwayat_keluarga.last_upload,
                            riwayat_pengangkatan.status_kepegawaian,
                            riwayat_pengangkatan.status_keaktivan,
                            riwayat_pengangkatan.tmt,
                            riwayat_pengangkatan.penempatan,
                            riwayat_pengangkatan.nomor_sk,
                            riwayat_pengangkatan.lembaga_pengangkat,
                            riwayat_pengangkatan.sumber_gaji,
                            riwayat_pengangkatan.upload_sk,
                            riwayat_pengangkatan.last_upload,
                            tmst_pajak.nomor_npwp,
                            tmst_pajak.upload_npwp,
                            tmst_askes.nama_askes,
                            tmst_askes.no_askes,
                            tmst_askes.upload_askes
                        FROM
                            tmst_karyawan
                        LEFT JOIN riwayat_keluarga ON tmst_karyawan.nik = riwayat_keluarga.nik
                        LEFT JOIN riwayat_pengangkatan ON tmst_karyawan.nik = riwayat_pengangkatan.nik
                        LEFT JOIN tmst_askes ON tmst_karyawan.nik = tmst_askes.nik
                        LEFT JOIN tmst_pajak ON tmst_karyawan.nik = tmst_pajak.nik
                        WHERE
                            tmst_karyawan.nik = $nik
                    ");
        return $hasil->result_array();
    }
    function get_karyawan_detil($nik)
    {
        $this->db->where(['nik' => $nik]);
        $hasil = $this->db->get('tmst_karyawan');
        return $hasil->result_array();
        //return $this->$hasil->affected_rows();
    }
    function add_karyawan($data)
    {
        $this->db->insert('tmst_karyawan', $data);
        return $this->db->affected_rows();
    }

    function delete_karyawan($nik){
        $this->db->delete('tmst_karyawan', ['nik' => $nik]);
        return $this->db->affected_rows();
    }

    function get_riwayat_jabatan($nik)
    {
        $this->db->where(['nik' => $nik]);
        $hasil = $this->db->get('riwayat_jabatan');
        return $hasil->result_array();
    }
    function get_riwayat_pelatihan($nik)
    {
        $this->db->where(['nik' => $nik]);
        $hasil = $this->db->get('riwayat_pelatihan');
        return $hasil->result_array();
    }
    function get_riwayat_pendidikan($nik)
    {
        $this->db->where(['nik' => $nik]);
        $hasil = $this->db->get('riwayat_pendidikan');
        return $hasil->result_array();
    }

    function get_riwayat_keluarga($nik)
    {
        $this->db->where(['nik' => $nik]);
        $hasil = $this->db->get('riwayat_keluarga');
        return $hasil->result_array();
    }
    function get_riwayat_pengangkatan($nik)
    {
        $this->db->where(['nik' => $nik]);
        $hasil = $this->db->get('riwayat_pengangkatan');
        return $hasil->result_array();
    }
    // update keluarga
    function insert_keluarga($data)
    {
        $this->db->insert('riwayat_keluarga', $data);
        return $this->db->affected_rows();
    }
    function update_keluarga($data, $nik)
    {
        $this->db->update('riwayat_keluarga', $data, ['nik' => $nik]);
        return $this->db->affected_rows();
    }
    // update kepegawaian
    function insert_pegawai($data)
    {
        $this->db->insert('riwayat_pengangkatan', $data);
        return $this->db->affected_rows();
    }
    function update_pegawai($data, $nik)
    {
        $this->db->update('riwayat_pengangkatan', $data, ['nik' => $nik]);
        return $this->db->affected_rows();
    }
    function update_kependudukan($data, $nik)
    {
        $this->db->update('tmst_karyawan', $data, ['nik' => $nik]);
        return $this->db->affected_rows();
    }
    function update_profil($data, $nik)
    {
        $this->db->update('tmst_karyawan', $data, ['nik' => $nik]);
        return $this->db->affected_rows();
    }
    function update_poto($data, $nik)
    {
        $this->db->update('tmst_karyawan', $data, ['nik' => $nik]);
        return $this->db->affected_rows();
    }

    //lainnya
    function get_pajak($nik)
    {
        $this->db->where(['nik' => $nik]);
        $hasil = $this->db->get('tmst_pajak');
        return $hasil->result_array();
    }
    function insert_npwp($data)
    {
        $this->db->insert('tmst_pajak', $data);
        return $this->db->affected_rows();
    }
    function update_npwp($data, $nik)
    {
        $this->db->update('tmst_pajak', $data, ['nik' => $nik]);
        return $this->db->affected_rows();
    }
    function get_askes($nik)
    {
        $this->db->where(['nik' => $nik]);
        $hasil = $this->db->get('tmst_askes');
        return $hasil->result_array();
    }
    function insert_askes($data)
    {
        $this->db->insert('tmst_askes', $data);
        return $this->db->affected_rows();
    }
    function update_askes($data, $nik)
    {
        $this->db->update('tmst_askes', $data, ['nik' => $nik]);
        return $this->db->affected_rows();
    }
}
