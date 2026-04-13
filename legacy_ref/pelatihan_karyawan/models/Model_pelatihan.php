<?php defined('BASEPATH') or exit('No direct script access allowed');
class Model_pelatihan extends CI_Model
{
    function __construct()
    {
        parent::__construct();
    }
    function get_karyawan($prodi)
    {
        $hasil = $this->db->query("SELECT
                                        *
                                        FROM
                                        tmst_karyawan
                                        INNER JOIN riwayat_jabatan ON tmst_karyawan.nik = riwayat_jabatan.nik
                                        WHERE
                                        riwayat_jabatan.id_biro = $prodi AND
                                        riwayat_jabatan.is_aktiv = 1");
        return $hasil->result_array();
        //return $this->$hasil->affected_rows();
    }
    function get_pelatihan($nik)
    {
        $hasil = $this->db->query(
            "SELECT
            tmst_karyawan.nik,
            tmst_karyawan.nama,
            riwayat_pelatihan.id,
            riwayat_pelatihan.nama_diklat,
            riwayat_pelatihan.no_sertifikat,
            riwayat_pelatihan.tahun,
            riwayat_pelatihan.tempat,
            riwayat_pelatihan.tanggal_mulai,
            riwayat_pelatihan.upload
        FROM
            tmst_karyawan
        LEFT JOIN riwayat_pelatihan ON tmst_karyawan.nik = riwayat_pelatihan.nik
        WHERE
            tmst_karyawan.nik = $nik
        ORDER BY
            riwayat_pelatihan.id ASC"
        );
        return $hasil->result_array();
    }

    function insert_pelatihan($data)
    {
        $this->db->insert('riwayat_pelatihan', $data);
        return $this->db->affected_rows();
    }
    function update_sertifikat($data, $id)
    {
        $this->db->update('riwayat_pelatihan', $data, ['id' => $id]);
        return $this->db->affected_rows();
    }
    function get_sertifikat($id)
    {
        $hasil = $this->db->get('riwayat_pelatihan', ['id' => $id]);
        return $hasil->result_array();
        //return $this->$hasil->affected_rows();
    }
    function get_riwayat($nik)
    {
        $this->db->where('nik', $nik);
        $hasil = $this->db->get('riwayat_pelatihan');
        return $hasil->result_array();
        //return $this->$hasil->affected_rows();
    }
}
