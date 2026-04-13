<?php defined('BASEPATH') or exit('No direct script access allowed');
class Model_pendidikan extends CI_Model
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
                                        riwayat_jabatan.is_aktiv =1 ");
        return $hasil->result_array();
        //return $this->$hasil->affected_rows();
    }
    function get_pendidikan($nik)
    {
        $hasil = $this->db->query(
            "SELECT
            tmst_karyawan.nama,
            tmst_karyawan.nik,
            riwayat_pendidikan.id,
            riwayat_pendidikan.id_pendidikan,
            riwayat_pendidikan.asal_pendidikan,
            riwayat_pendidikan.tahun_lulus,
            riwayat_pendidikan.upload_ijazah,
            riwayat_pendidikan.last_upload
            FROM
            tmst_karyawan
            LEFT OUTER JOIN riwayat_pendidikan ON tmst_karyawan.nik = riwayat_pendidikan.nik
            WHERE
            tmst_karyawan.nik =$nik
            ORDER BY
            riwayat_pendidikan.id_pendidikan ASC
            "
        );
        return $hasil->result_array();
    }
    function get_jenjang()
    {
        $hasil = $this->db->get('tref_pendidikan');
        return $hasil->result_array();
        //return $this->$hasil->affected_rows();
    }
    function insert_pendidikan($data)
    {
        $this->db->insert('riwayat_pendidikan', $data);
        return $this->db->affected_rows();
    }
    function update_ijazah($data, $id)
    {
        $this->db->update('riwayat_pendidikan', $data, ['id' => $id]);
        return $this->db->affected_rows();
    }
    function get_ijazah($id)
    {
        $hasil = $this->db->get('riwayat_pendidikan', ['id' => $id]);
        return $hasil->result_array();
        //return $this->$hasil->affected_rows();
    }
    function get_riwayat_pendidikan($nik)
    {
        $this->db->where('nik', $nik);
        $hasil = $this->db->get('riwayat_pendidikan');
        return $hasil->result_array();
        //return $this->$hasil->affected_rows();
    }
}
